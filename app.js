const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL 연결을 위한 pg 모듈 불러오기

const app = express();
const port = 3000; // 서버가 실행될 포트 번호

// 미들웨어 설정
app.use(cors()); // 모든 출처(Origin)로부터의 요청을 허용 (개발용)
app.use(express.json()); // JSON 형식의 요청 본문을 파싱하기 위해 추가 (POST 요청 시 필요)

// PostgreSQL 연결 설정
const pool = new Pool({
  user: 'max', // <<--- 중요: 여기에 본인의 Mac 사용자 이름 (예: 'max')을 입력하세요!
  host: 'localhost',
  database: 'my_blog_db', // <<--- 중요: DBeaver에서 생성한 데이터베이스 이름과 일치시키세요!
  password: '', // <<--- 중요: PostgreSQL 비밀번호를 설정했다면 여기에 입력 (없으면 비워둠)
  port: 5432, // PostgreSQL 기본 포트
});

// 데이터베이스 연결 테스트 및 posts 테이블 생성
pool.connect((err, client, release) => {
  if (err) {
    return console.error('데이터베이스 연결 오류:', err.stack);
  }
  console.log('PostgreSQL 데이터베이스에 성공적으로 연결되었습니다!');

  // posts 테이블 생성 (만약 테이블이 없으면 생성)
  client.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `, (err, res) => {
    release(); // 클라이언트 반환 (연결 해제)
    if (err) {
      return console.error('posts 테이블 생성 오류:', err.stack);
    }
    console.log('posts 테이블이 준비되었습니다 (없으면 생성).');
  });
});


// --- API 라우트 정의 ---

// 1. 루트 경로('/')
app.get('/', (req, res) => {
  res.send('Hello, Blog Backend!');
});

// 2. 모든 게시물 조회 API (GET 요청: /api/posts)
app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, content FROM posts ORDER BY created_at DESC');
    res.json(result.rows); // DB에서 가져온 행들을 JSON으로 응답
  } catch (err) {
    console.error('게시물 조회 오류:', err.stack);
    res.status(500).json({ error: '게시물을 불러오는데 실패했습니다.' });
  }
});

// 3. 새 게시물 생성 API (POST 요청: /api/posts)
app.post('/api/posts', async (req, res) => {
  const { title, content } = req.body; // 요청 본문(JSON)에서 title과 content 추출

  if (!title || !content) {
    return res.status(400).json({ error: '제목과 내용을 모두 입력해주세요.' }); // 필수 필드 검증
  }

  try {
    // DB에 새 게시물 삽입 후, 삽입된 게시물 정보 반환
    const result = await pool.query(
      'INSERT INTO posts(title, content) VALUES($1, $2) RETURNING id, title, content, created_at',
      [title, content] // $1, $2에 각각 title, content 값 바인딩
    );
    res.status(201).json(result.rows[0]); // 새로 생성된 게시물 정보 응답 (HTTP 201 Created)
  } catch (err) {
    console.error('게시물 저장 오류:', err.stack);
    res.status(500).json({ error: '게시물을 저장하는데 실패했습니다.' });
  }
});


// 서버 시작
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});