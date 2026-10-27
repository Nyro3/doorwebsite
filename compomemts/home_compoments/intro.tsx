
import img1 from "../../img/1.jpeg";
import backin from "../../img/backin.jpeg";
import "./intro.css"

function Intro() {
  return (
    <div className="intro-container">
      
 
      <img
        src={img1.src}
        alt="Logo"
        className="img1 "
      />  
      <div className="intro-text">
        <p>باب يليق ببيتك </p>
        <p>وشباك يدخل النور </p>
      </div>
    </div>
  );
}

export default Intro;
