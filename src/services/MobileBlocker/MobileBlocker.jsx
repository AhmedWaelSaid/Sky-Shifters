
import './MobileBlocker.css'; 

export default function MobileBlocker() {
  return (
    <div className="mobile-blocker">
       <h2>This website is currently unavailable on mobile devices</h2>
          <p>Please download our app from Google Play to continue using the service.</p>
          <a
            href="https://play.google.com/store/apps/details?id=YOUR_APP_ID"
            target="_blank"
            rel="noreferrer"
          >
            Download the app from Google Play
          </a>
    </div>
  );
}
