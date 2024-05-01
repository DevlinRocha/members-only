async function createPost(event) {
  event.preventDefault();

  try {
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const response = await fetch("api/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      window.location.href = "/";
    } else {
      console.error("Failed to create post");
    }
  } catch (error) {
    console.error("Error creating post:", error);
  }
}

async function deletePost(postId) {
  try {
    const response = await fetch(`api/post/${postId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      window.location.href = "/";
    } else {
      console.error("Failed to delete post");
    }
  } catch (error) {
    console.error("Error deleting post:", error);
  }
}

exports = { createPost, deletePost };
