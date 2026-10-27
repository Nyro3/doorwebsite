import CtaFooter from "@/compomemts/CtaFooter";
import Header from "../../compomemts/header";
import Intro from "../../compomemts/home_compoments/intro";
import ShopShow from "../../compomemts/home_compoments/shopshow";
import footer from "../../compomemts/CtaFooter";
export default function Home() {


  return (
  <>
    <Header></Header> 
    <Intro></Intro>
    <ShopShow></ShopShow>
<div className="details">
  <div className="detail-item">
    <p className="home_p1_big">خامات مختارة بعناية</p>
    <p className="home_p1_small">
      نختار الخشب والمعادن بمعايير تضمن لك عمر أطول
    </p>
  </div>

  <div className="detail-item">
    <p className="home_p2_big">تركيب على يد فنيين</p>
    <p className="home_p2_small">
      فني متخصص بياخد المقاسات ويركب بدقة عشان الشغل يطلع مظبوط
    </p>
  </div>

  <div className="detail-item">
    <p className="home_p3_big">خدمة بعد البيع</p>
    <p className="home_p3_small">
      لو احتجت صيانة أو تعديل إحنا موجودين وبنرد بسرعة
    </p>
  </div>
</div>
<CtaFooter></CtaFooter>
  </>
  
  )
}
