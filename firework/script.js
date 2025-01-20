"use strict";

window.addEventListener("load", function () {
  // Create and configure the canvas
  const canv = document.createElement("canvas");
  canv.style.position = "absolute";
  canv.style.top = "0";
  canv.style.left = "0";
  canv.style.width = "100%";
  canv.style.height = "100%";
  document.body.appendChild(canv);
  const ctx = canv.getContext("2d");

  // Initialize canvas size
  let maxx = window.innerWidth;
  let maxy = window.innerHeight;
  canv.width = maxx;
  canv.height = maxy;

  // Handle window resizing
  window.addEventListener("resize", () => {
    maxx = window.innerWidth;
    maxy = window.innerHeight;
    canv.width = maxx;
    canv.height = maxy;
  });

  // Utility functions for randomness
  const rand = (min, max) => Math.random() * (max - min) + min;
  const randInt = (min, max) => Math.floor(Math.random() * (max - min) + min);
  const randColor = () => `hsl(${randInt(0, 360)}, 100%, 50%)`;

  // Particle class representing individual explosion particles
  class Particle {
    constructor(x, y, color, speed, direction, gravity, friction, size) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.speed = speed;
      this.direction = direction;
      this.vx = Math.cos(direction) * speed;
      this.vy = Math.sin(direction) * speed;
      this.gravity = gravity;
      this.friction = friction;
      this.alpha = 1;
      this.decay = rand(0.005, 0.02); // Randomized decay for smoother fading
      this.size = size;
    }

    // Update particle properties
    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    // Draw the particle on the canvas
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }

    // Check if the particle is still visible
    isAlive() {
      return this.alpha > 0;
    }
  }

  // Firework class representing ascending fireworks
  class Firework {
    constructor(x, y, targetY, color, speed, size) {
      this.x = x;
      this.y = y;
      this.targetY = targetY;
      this.color = color;
      this.speed = speed;
      this.size = size;
      this.angle = -Math.PI / 2 + rand(-0.3, 0.3); // Increased variation in ascent angle
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.trail = [];
      this.trailLength = randInt(10, 25); // Increased trail length for smoother ascent
      this.exploded = false;
    }

    // Update firework position
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.trailLength) {
        this.trail.shift();
      }

      this.x += this.vx;
      this.y += this.vy;

      // Apply gravity (slightly slowing ascent)
      this.vy += 0.02;

      // Check if the firework has reached its target height or its vertical speed has reduced
      if (this.vy >= 0 || this.y <= this.targetY) {
        this.explode();
        return false; // Firework has exploded
      }
      return true; // Firework is still ascending
    }

    // Create explosion particles
    explode() {
      const numParticles = randInt(50, 150); // Increased range for more variability
      for (let i = 0; i < numParticles; i++) {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(2, 7); // Wider speed range for dynamic splatter
        const particleSize = rand(1, 5); // Wider size range for varied splatter
        explosions.push(
          new Particle(
            this.x,
            this.y,
            this.color,
            speed,
            angle,
            0.05, // gravity
            0.98, // friction
            particleSize
          )
        );
      }
    }

    // Draw the firework trail
    draw(ctx) {
      ctx.save();
      ctx.beginPath();
      if (this.trail.length > 1) {
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let point of this.trail) {
          ctx.lineTo(point.x, point.y);
        }
      } else {
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y);
      }
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
    }
  }

  let fireworks = []; // Active fireworks
  let explosions = []; // Active explosion particles

  // Launch a new firework at random intervals
  function launchFirework() {
    const x = rand(maxx * 0.1, maxx * 0.9); // Vary horizontal launch position
    const y = maxy; // Start from the bottom of the screen
    const targetY = rand(maxy * 0.1, maxy * 0.4); // Vary target height
    const color = randColor(); // Vibrant random colors
    const speed = rand(4, 8); // Vary ascent speeds
    const size = rand(2, 5); // Vary firework sizes
    fireworks.push(new Firework(x, y, targetY, color, speed, size));

    // Schedule next firework launch
    const timeout = rand(300, 800); // milliseconds
    setTimeout(launchFirework, timeout);
  }

  // Start the first firework launch
  launchFirework();

  // Animation loop
  function animate() {
    // Fade the canvas slightly to create motion trails
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // Increased opacity for smoother trails
    ctx.fillRect(0, 0, maxx, maxy);

    // Update and draw fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const firework = fireworks[i];
      if (!firework.update()) {
        fireworks.splice(i, 1); // Remove exploded firework
      } else {
        firework.draw(ctx);
      }
    }

    // Update and draw explosion particles
    for (let i = explosions.length - 1; i >= 0; i--) {
      const particle = explosions[i];
      particle.update();
      if (particle.isAlive()) {
        particle.draw(ctx);
      } else {
        explosions.splice(i, 1); // Remove faded particle
      }
    }

    requestAnimationFrame(animate);
  }

  animate(); // Start the animation loop

  // Optional: Launch fireworks on click
  window.addEventListener("click", function (event) {
    const x = event.clientX;
    const y = maxy; // Start from the bottom
    const targetY = event.clientY;
    const color = randColor();
    const speed = rand(4, 8); // Vary ascent speeds
    const size = rand(2, 5); // Vary firework sizes
    fireworks.push(new Firework(x, y, targetY, color, speed, size));
  });
});