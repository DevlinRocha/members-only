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

exports = { deletePost };
