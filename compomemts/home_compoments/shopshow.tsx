import Link from "next/link" 
import window from "../../img/windos.jpeg";
import inside_door from "../../img/inside door.jpeg";
import doors from "../../img/doors.jpeg";
import armored_door from "../../img/Armored door.jpeg";

import "./shopshow.css"

function shopshow() {
  return (
<div className="shopshow-container">
      

  
      <div className="shopshow-text">
        <p className="small">تشكليتنا</p>
        <p className="big">كل الي بيتك محتاجه من ابواب وشبابيك</p>
    <Link href="/doors/wood" className="link">
          <img src={doors.src} alt="Doors" className="doors" />
        </Link>
    
    <Link href="/windows" className="link">
          <img src={window.src} alt="window" className="doors" />
        </Link>

        <Link href="/doors/interior" className="link">
          <img src={inside_door.src} alt="inside_door" className="doors" />
        </Link>

        <Link href="/doors/armored" className="link">
          <img src={armored_door.src} alt="Armored_door" className="doors" />
        </Link>

    </div>
    </div>
  
  )
}

export default shopshow;
