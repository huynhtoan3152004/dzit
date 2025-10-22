import { useEffect, useRef } from "react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import "./happy-birthday-style.css";
import ballon1 from "../../img/ballon1.svg?url";
import ballon2 from "../../img/ballon2.svg?url";
import ballon3 from "../../img/ballon3.svg?url";
import celebrationPhoto from "../../img/irene.jpg";

const messages = [
  "Hôm nay là ngày đặc biệt nhất – chúc bạn có một sinh nhật thật rực rỡ!",
  "Cảm ơn bạn vì đã luôn lan tỏa năng lượng tích cực đến mọi người xung quanh.",
  "Mong rằng mọi ước mơ của bạn đều trở thành hiện thực trong tuổi mới.",
  "Hãy tận hưởng từng khoảnh khắc tuyệt vời, vì bạn xứng đáng với tất cả niềm vui này!",
];

export type HappyBirthdayProps = {
  onClose: () => void;
};

function HappyBirthday({ onClose }: HappyBirthdayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const photoRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<HTMLParagraphElement[]>([]);
  const balloonRefs = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(photoRef.current, { autoAlpha: 0 });
      gsap.set(actionsRef.current, { autoAlpha: 0 });
      gsap.set(balloonRefs.current, { autoAlpha: 0, yPercent: 40 });

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      messageRefs.current.forEach((node) => {
        if (!node) {
          return;
        }

        gsap.set(node, { autoAlpha: 0, y: 40 });
      });

      messageRefs.current.forEach((node) => {
        if (!node) {
          return;
        }

        timeline
          .to(node, { autoAlpha: 1, y: 0, duration: 0.8 })
          .to(node, { autoAlpha: 0, y: -40, duration: 0.6 }, "+=1.8");
      });

      timeline
        .to(photoRef.current, { autoAlpha: 1, duration: 0.8 }, "-=0.3")
        .to(
          balloonRefs.current,
          {
            autoAlpha: 1,
            yPercent: -20,
            duration: 1.6,
            stagger: 0.2,
            ease: "elastic.out(1, 0.85)",
          },
          "-=0.2"
        )
        .add(() => {
          confetti({
            particleCount: 160,
            spread: 75,
            origin: { y: 0.8 },
            scalar: 0.9,
          });
          setTimeout(() => {
            confetti({
              particleCount: 120,
              spread: 110,
              origin: { y: 0.6 },
              scalar: 1.1,
            });
          }, 300);
        })
        .to(actionsRef.current, { autoAlpha: 1, duration: 0.6 }, "+=0.2");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="hbd-overlay" ref={containerRef}>
      <div className="hbd-overlay__title">Happy Birthday 🎂</div>
      {messages.map((message, index) => (
        <p
          key={index}
          ref={(element) => {
            if (element) {
              messageRefs.current[index] = element;
            }
          }}
          className="hbd-overlay__message"
        >
          {message}
        </p>
      ))}

      <div className="hbd-overlay__photo" ref={photoRef}>
        <img src={celebrationPhoto} alt="Happy birthday celebration" />
      </div>

      <div className="hbd-overlay__balloons">
        {[ballon1, ballon2, ballon3].map((balloon, index) => (
          <img
            key={balloon}
            ref={(element) => {
              if (element) {
                balloonRefs.current[index] = element;
              }
            }}
            className="hbd-overlay__balloon"
            src={balloon}
            alt={`Balloon ${index + 1}`}
          />
        ))}
      </div>

      <div className="hbd-overlay__actions" ref={actionsRef}>
        <button className="hbd-overlay__button" onClick={onClose}>
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
}

export default HappyBirthday;
