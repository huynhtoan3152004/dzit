import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import "./happy-birthday-style.css";
import ballon1 from "../../img/ballon1.svg?url";
import ballon2 from "../../img/ballon2.svg?url";
import ballon3 from "../../img/ballon3.svg?url";
import celebrationPhoto from "../../img/irene.jpg";

const messages = [
  "Chúc bạn thêm một tuổi mới thật ấm áp và bình an.",
  "Mình luôn ở đây, sẵn sàng lắng nghe và đồng hành cùng bạn.",
  "Mong bạn luôn giữ được nụ cười và niềm tin vào chính mình.",
  "Khi mệt, cứ tựa vào mình – bạn không bao giờ phải đi một mình đâu.",
  "Mọi ước mơ của bạn rồi sẽ có cách để thành hiện thực.",
  "Cảm ơn vì đã là một người bạn tuyệt vời – và mình tự hào về bạn.",
  "Hôm nay hãy chậm lại, tận hưởng từng phút giây thuộc về bạn.",
  "Dù có chuyện gì, mình vẫn ở đây – một chỗ dựa vững chắc cho bạn.",
  "Chúc bạn mạnh mẽ, dịu dàng và luôn được yêu thương.",
  "Tuổi mới rực rỡ – và bạn xứng đáng với những điều tốt đẹp nhất.",
];

// Wishes will be shown sequentially ~10s each

export type HappyBirthdayProps = {
  onClose: () => void;
};

function HappyBirthday({ onClose }: HappyBirthdayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const photoRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const messageRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const balloonRefs = useRef<(HTMLImageElement | null)[]>([]);
  const finalRef = useRef<HTMLDivElement | null>(null);

  // Prepare a bunch of balloons with randomized initial positions and sizes
  const balloons = useMemo(() => {
    const sprites = [ballon1, ballon2, ballon3];
    const count = 14;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      src: sprites[i % sprites.length],
      left: Math.random() * 88 + 6, // percentage from 6% to 94%
      scale: 0.75 + Math.random() * 0.6, // 0.75 - 1.35
      delay: Math.random() * 2,
    }));
  }, []);

  const launchFireworks = () => {
    const bursts = 4;
    const interval = 320;
    for (let i = 0; i < bursts; i += 1) {
      setTimeout(() => {
        confetti({
          particleCount: 110,
          spread: 80,
          scalar: 0.95,
          origin: { x: 0.2 + Math.random() * 0.6, y: 0.9 },
        });
      }, i * interval);
    }
  };

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      // Initial states
  gsap.set(titleRef.current, { autoAlpha: 0, y: -12 });
  gsap.set(photoRef.current, { autoAlpha: 0, scale: 0.95, y: 18, force3D: true });
  gsap.set(finalRef.current, { autoAlpha: 0, y: 10 });
      gsap.set(actionsRef.current, { autoAlpha: 0 });
      gsap.set(balloonRefs.current, {
        autoAlpha: 0,
        y: () => window.innerHeight * 0.25,
        transformOrigin: "50% 100%",
        force3D: true,
      });

      // Prepare message nodes hidden
      messageRefs.current.forEach((node) => {
        if (!node) return;
        gsap.set(node, { autoAlpha: 0, y: 24 });
      });

      // Sequence: show each message ~5s, then fade and show final
      const sequence = gsap.timeline({ defaults: { ease: "power3.out" } });
      messages.forEach((_, i) => {
        const node = messageRefs.current[i];
        if (!node) return;
        sequence
          .to(node, { autoAlpha: 1, y: 0, duration: 0.8 })
          // hold visible ~4.2s then fade out
          .to(node, { autoAlpha: 0, y: -16, duration: 0.6 }, "+=4.2");
      });

      // After messages: reveal title, photo, button and fireworks
      sequence
        .to(finalRef.current, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power4.out" }, "+=0.2")
        .to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" }, "<0.05")
        .to(photoRef.current, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" }, "<")
        .to(actionsRef.current, { autoAlpha: 1, duration: 0.6 }, "+=0.1")
        .add(launchFireworks);

      // Continuous balloon float animation
      balloonRefs.current.forEach((el, i) => {
        if (!el) return;
        const drift = 20 + Math.random() * 60; // px
        const duration = 8 + Math.random() * 6; // seconds
        const startDelay = (i % 7) * 0.25;

        gsap.set(el, {
          x: 0,
          y: window.innerHeight * (0.5 + Math.random() * 0.6),
          rotation: -4 + Math.random() * 8,
          opacity: 0,
        });

        const loop = () => {
          gsap
            .timeline({ repeat: 0 })
            .to(el, {
              autoAlpha: 1,
              duration: 0.6,
              ease: "sine.out",
              delay: startDelay,
            })
            .to(
              el,
              {
                y: -window.innerHeight - 200,
                x: `+=${(Math.random() > 0.5 ? 1 : -1) * drift}`,
                rotation: "+=6",
                duration,
                ease: "sine.inOut",
                onComplete: () => {
                  // reset to bottom with new slight randomization
                  gsap.set(el, {
                    y: window.innerHeight + 80,
                    x: `-=${(Math.random() > 0.5 ? 1 : -1) * drift}`,
                    rotation: -4 + Math.random() * 8,
                  });
                  loop();
                },
              }
            );
        };

        loop();
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="hbd-overlay" ref={containerRef}>
      <div className="hbd-overlay__stars" aria-hidden="true" />

      <div className="hbd-overlay__content">
        <div className="hbd-overlay__message-area">
          {messages.map((m, idx) => (
            <p
              key={idx}
              ref={(el) => (messageRefs.current[idx] = el)}
              className="hbd-overlay__message"
            >
              {m}
            </p>
          ))}
        </div>

        <div className="hbd-overlay__final" ref={finalRef}>
          <h1 className="hbd-overlay__title" ref={titleRef}>
            Happy Birthday Như Quỳnh
          </h1>
          <div className="hbd-overlay__card" ref={photoRef}>
            <div className="hbd-overlay__photo">
              <img src={celebrationPhoto} alt="Happy Birthday" />
            </div>
          </div>
        </div>
      </div>

      <div className="hbd-overlay__balloons" aria-hidden="true">
        {balloons.map((b, index) => (
          <img
            key={b.id}
            ref={(el) => {
              balloonRefs.current[index] = el;
            }}
            className="hbd-overlay__balloon"
            src={b.src}
            alt=""
            style={{ left: `${b.left}%`, transform: `scale(${b.scale})` }}
          />
        ))}
      </div>

      <div className="hbd-overlay__actions" ref={actionsRef}>
        <button
          className="hbd-overlay__button hbd-overlay__button--fixed"
          onClick={onClose}
        >
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
}

export default HappyBirthday;
