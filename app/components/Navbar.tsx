"use client";

import { Button, Layout } from "antd";
import Link from "antd/es/typography/Link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const { Header } = Layout;

interface Props {
  user?: { name: string };
}

const NavbarUser: React.FC<Props> = ({ user }) => {
  const navigate = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      opacity: number;
    }> = [];

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
      initParticles();
    };

    // Initialize particles
    const initParticles = () => {
      particles = [];
      const cols = Math.floor(canvas.width / 50);
      const rows = Math.floor(canvas.height / 50);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          particles.push({
            x: i * 50 + 25,
            y: j * 50 + 25,
            baseX: i * 50 + 25,
            baseY: j * 50 + 25,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.3 + 0.1,
          });
        }
      }
    };

    // Draw grid lines
    const drawGrid = () => {
      // ctx.strokeStyle = "rgba(100, 150, 255, 0.08)";
      ctx.lineWidth = 1;

      // Vertical lines
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
    };

    // Animate particles
    const animate = () => {
      ctx.fillStyle = "rgb(15, 16, 30)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid();

      particles.forEach((p) => {
        // Update position with floating effect
        p.x += p.vx;
        p.y += p.vy;

        // Bounce back towards base position
        const dx = p.baseX - p.x;
        const dy = p.baseY - p.y;
        p.vx += dx * 0.001;
        p.vy += dy * 0.001;

        // Add damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Draw particle
        ctx.beginPath();
        // ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 150, 255, ${p.opacity})`;
        ctx.fill();

        // Draw connecting lines to nearby particles
        particles.forEach((p2) => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 100 && dist > 0) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(100, 150, 255, ${0.05 * (1 - dist / 100)})`;
            // ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <Header
      style={{
        paddingTop: 45,
        background: "#0f101e",
        height: "auto",
        lineHeight: "normal",
        padding: 0,
        boxShadow: "none",
        position: "relative",
        overflow: "hidden",
      }}>
      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-16 pt-6">
        <div className="flex items-center justify-between h-18">
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center space-x-2">
              <Image src="/images/Logo.png" alt="OSD Logo" width={160} height={100} />
            </a>
          </div>
          <nav className="hidden md:flex items-center space-x-10">
            <Link className="!text-white transition-colors hover:scale-105 hover:text-gray-400 transform !text-2xl uppercase">{`About`}</Link>
            <Link href="#" className="!text-white transition-colors hover:scale-105 hover:text-gray-400 transform !text-2xl uppercase">
              {`Features`}
            </Link>
            <Link href="#" className="!text-white transition-colors hover:scale-105 hover:text-gray-400 transform !text-2xl uppercase">
              {`Resources`}
            </Link>
            <Link href="#" className="!text-white transition-colors hover:scale-105 hover:text-gray-400 transform !text-2xl uppercase">
              {`Support`}
            </Link>
            <Button type="primary" className="!bg-[#6366F1] !text-black transition-all !rounded-4xl w-[180px] !h-[60px] !text-2xl ">
              {`Purchase`}
            </Button>
          </nav>
        </div>
        <div className="grid justify-center items-center text-center mt-20">
          <span className="text-5xl font-bold mb-5">{`The Cave of Creation`}</span>
          <span className="block text-lg text-gray-400 w-200">
            {`Elit eu odio interdum facilisis curabitur mauris phasellus vitae. Pretium fames vel tortor et arcu, faucibus semper egestas amet. Venenatis arcu viverra feugiat vel libero`}
          </span>
          <div className="mt-5 gap-2 flex mb-20 mt-10 items-center text-center justify-center">
            <Button className="!bg-[#3A3A3A] !text-white transition-all !rounded-4xl w-[240px] !h-[60px] !text-xl">Explore sections</Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[250px] overflow-hidden z-0">
        <img src="/images/bg_header.png" alt="" className="absolute bottom-[-70px] right-0 opacity-40" />
      </div>
    </Header>
  );
};

export default NavbarUser;
