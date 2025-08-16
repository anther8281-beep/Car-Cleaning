<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Modern Website</title>
  <link rel="stylesheet" href="styles.css" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
  <header class="navbar">
    <div class="container">
      <h1 class="logo">MySite</h1>
      <nav>
        <ul class="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </div>
:root {
  --primary-color: #1e88e5;
  --secondary-color: #f5f5f5;
  --text-color: #333;
  --font-family: 'Inter', sans-serif;
  --spacing: 1rem;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  line-height: 1.6;
  color: var(--text-color);
  background-color: #fff;
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: auto;
}

.navbar {
  background-color: var(--secondary-color);
  padding: var(--spacing) 0;
  border-bottom: 1px solid #ddd;
}

.navbar .logo {
  font-size: 1.5rem;
  color: var(--primary-color);
  font-weight: 600;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: var(--spacing);
}

.nav-links a {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
}

.hero {
  background: var(--primary-color);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.hero h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: var(--primary-color);
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 3rem 0;
  justify-content: space-between;
}

.feature-box {
  flex: 1;
  min-width: 250px;
  background-color: var(--secondary-color);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.footer {
  text-align: center;
  padding: 2rem 0;
  background-color: var(--secondary-color);
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 768px) {
  .features {
    flex-direction: column;
    align-items: center;
  }

  .navbar .container {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
    padding-top: 1rem;
  }

  .nav-links a {
    padding: 0.5rem 0;
  }
}
