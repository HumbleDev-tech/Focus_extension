function hideComments() {
  const comments = document.getElementById('comments');
  if (comments) {
    comments.style.display = 'none';
  }
}

hideComments();
setTimeout(hideComments, 3000);
