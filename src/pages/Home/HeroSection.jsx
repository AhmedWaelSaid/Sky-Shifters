
import './HeroSection.css';
import homephoto from '../../assets/home page pic.png'

export default function HeroSection() {
  return (
 <>
    <section className="hero-section">
      <img src={homephoto} alt="" className='homephoto' />
      </section>
 </>
  );
}