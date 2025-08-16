
## Quick Preview

The homepage features a hero section, service cards, testimonials, and a booking form:

```html
<section class="hero">
  <h1>Premium Car Cleaning</h1>
  <p>Experience a spotless ride. Book your appointment today!</p>
  <a href="#booking" class="btn-primary">Book Now</a>
</section>
<form id="booking-form">
  <input type="text" placeholder="Full Name" required>
  <input type="email" placeholder="Email Address" required>
  <input type="date" required>
  <select>
    <option>Basic Clean</option>
    <option>Premium Detail</option>
  </select>
  <button type="submit">Book Appointment</button>
</form>
