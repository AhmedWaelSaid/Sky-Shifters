import styles from './FinalDetails.module.css';
import FlightSummary from '../FlightSummary/FlightSummary';
import PaymentSection from '../PaymentSection/PaymentSection'; // مكون الدفع المتخصص
import PropTypes from 'prop-types';

const FinalDetails = ({ passengers, formData, onBack }) => {

  // هذه الدالة سيتم استدعاؤها من "ابنها" PaymentSection عند نجاح الدفع
  const handlePaymentSuccess = (result) => {
    console.log("Booking and Payment successful!", result);
    // هنا يمكنك توجيه المستخدم لصفحة تأكيد الحجز النهائية
    // مثال: navigate(`/booking-confirmation/${result.booking?.bookingId}`);
    alert("Your booking is confirmed!");
  };

  // لاحظ أننا حذفنا كل الـ state والـ functions الخاصة بالدفع من هنا،
  // لأنها أصبحت موجودة ومنظمة داخل PaymentSection.
  
  return (
    <div className={styles.finalDetails}>
      <div className={styles.mainContent}>
        
        {/* الآن، هذا المكون يعرض فقط مكون الدفع ويمرر له البيانات.
          هذا يجعل الكود نظيفًا ومنظمًا.
        */}
        <PaymentSection 
          // 1. تمرير بيانات الحجز الجاهزة التي قمنا بتجميعها في Index.jsx
          bookingData={formData.finalBookingData} 
          
          // 2. تمرير دالة للتعامل مع نجاح الدفع
          onPaymentSuccess={handlePaymentSuccess}
          
          // 3. تمرير دالة للرجوع للخطوة السابقة
          onBack={onBack}
        />

      </div>
      
      <div className={styles.sidebar}>
        {/* مكون ملخص الرحلة يبقى كما هو لعرض التفاصيل للمستخدم */}
        <FlightSummary 
          passengers={passengers} 
          formData={formData}
          // لا نحتاج لأزرار هنا لأنها موجودة داخل PaymentSection
          showBackButton={false}
          showContinueButton={false}
        />
      </div>
    </div>
  );
};

// تعريف الـ props التي يستقبلها المكون
FinalDetails.propTypes = {
    passengers: PropTypes.array.isRequired,
    formData: PropTypes.object.isRequired,
    onBack: PropTypes.func.isRequired,
};

export default FinalDetails;