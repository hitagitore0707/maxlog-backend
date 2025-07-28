<script setup>
import { ref, onMounted } from 'vue';

// 게시물 목록을 저장할 반응형 데이터
const posts = ref([]);
const errorMessage = ref(''); // 에러 메시지를 저장할 반응형 데이터

// 새 게시물 작성을 위한 반응형 데이터
const newPostTitle = ref('');
const newPostContent = ref('');

// --- 게시물 불러오기 함수 ---
const fetchPosts = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/posts');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    posts.value = data; // 받아온 데이터를 posts에 할당
    errorMessage.value = ''; // 성공 시 에러 메시지 초기화

  } catch (error) {
    console.error("Failed to fetch posts:", error);
    errorMessage.value = `게시물을 불러오는데 실패했습니다: ${error.message}`;
  }
};

// --- 새 게시물 생성 함수 ---
const createPost = async () => {
  if (!newPostTitle.value || !newPostContent.value) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/posts', {
      method: 'POST', // POST 요청
      headers: {
        'Content-Type': 'application/json', // JSON 형식으로 데이터 전송
      },
      body: JSON.stringify({ // JavaScript 객체를 JSON 문자열로 변환하여 전송
        title: newPostTitle.value,
        content: newPostContent.value,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json(); // 백엔드에서 보낸 에러 메시지를 받기 위해
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
    }

    // 게시물 생성 성공 시, 입력 필드 초기화 및 게시물 목록 새로고침
    newPostTitle.value = '';
    newPostContent.value = '';
    await fetchPosts(); // 새로운 글을 포함하여 목록을 다시 불러옵니다.
    alert('게시물이 성공적으로 생성되었습니다!');

  } catch (error) {
    console.error("Failed to create post:", error);
    errorMessage.value = `게시물 생성에 실패했습니다: ${error.message}`;
    alert(errorMessage.value);
  }
};

// 컴포넌트가 마운트(화면에 나타남)된 후에 게시물 목록을 불러옵니다.
onMounted(fetchPosts);
</script>

<template>
  <div id="app">
    <h1>나의 블로그</h1>

    <div class="post-form">
      <h2>새 게시물 작성</h2>
      <input type="text" v-model="newPostTitle" placeholder="제목을 입력하세요" />
      <textarea v-model="newPostContent" placeholder="내용을 입력하세요"></textarea>
      <button @click="createPost">게시물 작성</button>
    </div>

    <hr />

    <h2>블로그 게시물</h2>
    <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>

    <p v-else-if="posts.length === 0">게시물을 불러오는 중이거나, 게시물이 없습니다.</p>

    <div v-else class="post-list">
      <div v-for="post in posts" :key="post.id" class="post-item">
        <h3>{{ post.title }}</h3>
        <p>{{ post.content }}</p>
        <small>작성일: {{ new Date(post.created_at).toLocaleString() }}</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.post-form {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.post-form input[type="text"],
.post-form textarea {
  width: calc(100% - 20px);
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
}
.post-form textarea {
  height: 120px;
  resize: vertical;
}
.post-form button {
  background-color: #42b983;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}
.post-form button:hover {
  background-color: #368a68;
}

hr {
  margin: 40px auto;
  width: 50%;
  border: none;
  border-top: 1px solid #eee;
}

.post-list {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.post-item {
  border: 1px solid #ccc;
  padding: 15px;
  margin: 10px auto;
  max-width: 600px;
  width: 100%;
  text-align: left;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
h1, h2 {
  color: #34495e;
}
h3 {
  color: #2c3e50;
  font-size: 1.3em;
  margin-bottom: 8px;
}
p {
  line-height: 1.6;
  color: #555;
  margin-bottom: 5px;
}
small {
  color: #888;
  font-size: 0.8em;
}
</style>