const app = require("./src/app");

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`CommunityHub backend is running on http://localhost:${PORT}`);
});