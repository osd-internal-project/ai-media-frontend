"use client";
import { Button, Card, Image } from "antd";
import { RocketOutlined } from "@ant-design/icons";
import { useEffect, useRef, type FC } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

const Page: FC = () => {
  // const navigate = useRouter();

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
    <>
      <div className="px-20 py-20 flex flex-col items-center justify-center space-y-4 text-cente bg-[#171717] ">
        <div>
          <div className="grid grid-cols-2 mb-15">
            <div className="col-span-1 flex flex-col items-start justify-start space-y-4 pr-10">
              <span className="text-[44px] font-bold">{`Product Highlight`}</span>
            </div>
            <div className="col-span-1 flex flex-col items-start justify-start">
              <div className="flex justify-end w-full gap-5">
                <div>
                  <Button className="!bg-transparent !border-amber-50 hover:!border-[#87DDDEA6] hover:!text-[#87DDDEA6] w-auto !px-10" size="large">
                    <span className="uppercase">{`Design`}</span>
                  </Button>
                </div>
                <div>
                  <Button className="!bg-transparent !border-amber-50 hover:!border-[#87DDDEA6] hover:!text-[#87DDDEA6] w-auto !px-10" size="large">
                    <span className="uppercase"> {`branding`}</span>
                  </Button>
                </div>
                <div>
                  <Button className="!bg-transparent !border-amber-50 hover:!border-[#87DDDEA6] hover:!text-[#87DDDEA6] w-auto !px-10" size="large">
                    <span className="uppercase"> {`marketing`}</span>
                  </Button>
                </div>
                <div>
                  <Button className="!bg-transparent !border-amber-50 hover:!border-[#87DDDEA6] hover:!text-[#87DDDEA6] w-auto !px-10" size="large">
                    <span className="uppercase"> {`business`}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-9">
            <Card className="grid grid-cols-1 w-full !bg-[#282828] !p-5 !rounded-2xl">
              <div className="flex justify-start mb-3">
                <div className="!bg-[#716D6D] p-1 rounded-2xl">
                  <RocketOutlined className="transform rotate-45 text-4xl !text-white" />
                </div>
              </div>
              <div className="flex justify-start text-[32px] font-bold mb-2">{`Seedream`}</div>
              <div className="flex justify-start text-left text-[18px] mb-2">{`multi-image blending, sequentially batch image generation, element addition or removal, and style transfer—covering a wide spectrum of needs from creative expression to precise refinements, delivering a one-stop solution for image generation and editing.`}</div>
              <div className="mt-5 flex justify-start">
                <a type="link" className="text-left p-0 border-b !text-white border-white inline-block">
                  <span className="uppercase font-bold text-xl">{`read more`}</span>
                </a>
              </div>
            </Card>
            <Card className="grid grid-cols-1 w-full !bg-[#282828] !p-5 !rounded-2xl">
              <div className="flex justify-start mb-3">
                <div className="!bg-[#716D6D] p-1 rounded-2xl">
                  <RocketOutlined className="transform rotate-45 text-4xl !text-white" />
                </div>
              </div>
              <div className="flex justify-start text-[32px] font-bold mb-2">{`Seedance`}</div>
              <div className="flex justify-start text-left text-[18px] mb-2">{`Seedance, the large-parameter version of the model suite, features a unique multi-shot storytelling capability and demonstrates outstanding performance across multiple dimensions.`}</div>
              <div className="mt-5 flex justify-start">
                <a type="link" className="text-left p-0 border-b !text-white border-white inline-block">
                  <span className="uppercase font-bold text-xl">{`read more`}</span>
                </a>
              </div>
            </Card>
            <Card className="grid grid-cols-1 w-full !bg-[#282828] !p-5 !rounded-2xl">
              <div className="flex justify-start mb-3">
                <div className="!bg-[#716D6D] p-1 rounded-2xl">
                  <RocketOutlined className="transform rotate-45 text-4xl !text-white" />
                </div>
              </div>
              <div className="flex justify-start text-[32px] font-bold mb-2">{`Seededit`}</div>
              <div className="flex justify-start text-left text-[18px] mb-2">{`Elit eu odio interdum facilisis curabitur mauris phasellus vitae. Pretium fames vel tortor et arcu, faucibus semper egestas amet. Venenatis arcu viverra feugiat vel libero`}</div>
              <div className="mt-5 flex justify-start">
                <a type="link" className="text-left p-0 border-b !text-white border-white inline-block">
                  <span className="uppercase font-bold text-xl">{`read more`}</span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
      {/* --------------------------------- */}
      <div className="relative px-20 py-20 flex flex-col items-center justify-center space-y-4 text-center ">
        <canvas
          ref={canvasRef}
          style={{
            marginBottom: "0px",
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        />
        <div>
          <div className="grid grid-cols-2 mb-15">
            <div className="col-span-1 flex flex-col items-start justify-start space-y-4 pr-10">
              <span className="text-[44px] font-bold z-10">{`Our services`}</span>
            </div>
            <div className="col-span-1 flex flex-col items-start justify-start">
              <div className="flex justify-end w-full gap-5">
                <div>
                  <Button className="!bg-transparent !border-amber-50 hover:!border-[#87DDDEA6] hover:!text-[#87DDDEA6] w-auto !px-10" size="large">
                    <span className="uppercase">{`Design`}</span>
                  </Button>
                </div>
                <div>
                  <Button className="!bg-transparent !border-amber-50 hover:!border-[#87DDDEA6] hover:!text-[#87DDDEA6] w-auto !px-10" size="large">
                    <span className="uppercase"> {`development`}</span>
                  </Button>
                </div>
                <div>
                  <Button className="!bg-transparent !border-amber-50 hover:!border-[#87DDDEA6] hover:!text-[#87DDDEA6] w-auto !px-10" size="large">
                    <span className="uppercase"> {`branding`}</span>
                  </Button>
                </div>
                <div>
                  <Button className="!bg-transparent !border-amber-50 hover:!border-[#87DDDEA6] hover:!text-[#87DDDEA6] w-auto !px-10" size="large">
                    <span className="uppercase"> {`marketing`}</span>
                  </Button>
                </div>
                <div>
                  <Button className="!bg-transparent !border-amber-50 hover:!border-[#87DDDEA6] hover:!text-[#87DDDEA6] w-auto !px-10" size="large">
                    <span className="uppercase"> {`business`}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-9">
            <Card className="grid grid-cols-1 w-full !bg-[#282828] !p-5 !rounded-2xl">
              <div className="flex justify-start mb-3 gap-4">
                <div className="!bg-[#716D6D] p-1 rounded-2xl items-center">
                  <RocketOutlined className="transform rotate-45 text-4xl !text-white" />
                </div>
                <div className="flex justify-start text-[32px] font-bold">{`Technology`}</div>
              </div>
              <div className="flex justify-start text-left text-[18px] mb-2">{`Elit eu odio interdum facilisis curabitur mauris phasellus vitae. Pretium fames vel tortor et arcu, faucibus`}</div>
              <div className="mt-5 flex justify-start">
                <a type="link" className="text-left p-0 border-b !text-white border-white inline-block">
                  <span className="uppercase font-bold text-xl">{`read more`}</span>
                </a>
              </div>
            </Card>
            <Card className="grid grid-cols-1 w-full !bg-[#282828] !p-5 !rounded-2xl">
              <div className="flex justify-start mb-3 gap-4">
                <div className="!bg-[#716D6D] p-1 rounded-2xl items-center">
                  <RocketOutlined className="transform rotate-45 text-4xl !text-white" />
                </div>
                <div className="flex justify-start text-[32px] font-bold">{`Technology`}</div>
              </div>
              <div className="flex justify-start text-left text-[18px] mb-2">{`Elit eu odio interdum facilisis curabitur mauris phasellus vitae. Pretium fames vel tortor et arcu, faucibus`}</div>
              <div className="mt-5 flex justify-start">
                <a type="link" className="text-left p-0 border-b !text-white border-white inline-block">
                  <span className="uppercase font-bold text-xl">{`read more`}</span>
                </a>
              </div>
            </Card>
            <Card className="grid grid-cols-1 w-full !bg-[#282828] !p-5 !rounded-2xl">
              <div className="flex justify-start mb-3 gap-4">
                <div className="!bg-[#716D6D] p-1 rounded-2xl items-center">
                  <RocketOutlined className="transform rotate-45 text-4xl !text-white" />
                </div>
                <div className="flex justify-start text-[32px] font-bold">{`Technology`}</div>
              </div>
              <div className="flex justify-start text-left text-[18px] mb-2">{`Elit eu odio interdum facilisis curabitur mauris phasellus vitae. Pretium fames vel tortor et arcu, faucibus`}</div>
              <div className="mt-5 flex justify-start">
                <a type="link" className="text-left p-0 border-b !text-white border-white inline-block">
                  <span className="uppercase font-bold text-xl">{`read more`}</span>
                </a>
              </div>
            </Card>
            <Card className="grid grid-cols-1 w-full !bg-[#282828] !p-5 !rounded-2xl">
              <div className="flex justify-start mb-3 gap-4">
                <div className="!bg-[#716D6D] p-1 rounded-2xl items-center">
                  <RocketOutlined className="transform rotate-45 text-4xl !text-white" />
                </div>
                <div className="flex justify-start text-[32px] font-bold">{`Technology`}</div>
              </div>
              <div className="flex justify-start text-left text-[18px] mb-2">{`Elit eu odio interdum facilisis curabitur mauris phasellus vitae. Pretium fames vel tortor et arcu, faucibus`}</div>
              <div className="mt-5 flex justify-start">
                <a type="link" className="text-left p-0 border-b !text-white border-white inline-block">
                  <span className="uppercase font-bold text-xl">{`read more`}</span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
      {/* -------------------------- */}
      <div className="px-20 py-20 space-y-4 text-cente bg-[#171717] ">
        <div className="grid grid-cols-2 gap-4">
          <div className="col col-span-1 pr-30">
            <div className="col-span-1 flex flex-col items-start justify-start space-y-4 pr-10">
              <span className="text-[44px] font-bold z-10">{`VDO services`}</span>
            </div>
            <div className="col-span-1 flex flex-col items-start justify-start space-y-4 pr-10">
              <span className="mt-5 text-[18px]  z-10">{`Elit eu odio interdum facilisis curabitur mauris phasellus vitae. Pretium fames vel tortor et arcu, faucibus semper egestas amet. Venenatis arcu viverra feugiat vel libero`}</span>
            </div>
            <div className="flex justify-start mt-10">
              <img src="/images/vdo_title.png" className="w-full" />
            </div>
          </div>
          <div className="col col-span-1 ">
            <div className="grid grid-cols-2 !gap-10 w-full">
              <div className="col col-span-1 w-full !space-y-10 mb-[-100px] mt-[-50px]">
                <Card className="grid grid-cols-1 w-full !bg-[#282828] !p-5 !rounded-2xl">
                  <div className="flex justify-start mb-3 gap-4">
                    <div className="!bg-[#716D6D] p-1 rounded-2xl items-center">
                      <RocketOutlined className="transform rotate-45 text-4xl !text-white" />
                    </div>
                    <div className="flex justify-start text-[32px] font-bold">{`Seedance`}</div>
                  </div>
                  <div className="flex justify-start text-left text-[18px] mb-2">{`Elit eu odio interdum facilisis curabitur mauris phasellus vitae. Pretium fames vel tortor et arcu, faucibus`}</div>
                  <div className="mt-20 flex justify-start">
                    <a type="link" className="text-left p-0 border-b !text-white border-white inline-block">
                      <span className="uppercase font-bold text-xl">{`read more`}</span>
                    </a>
                  </div>
                </Card>
                <Card className="grid grid-cols-1 w-full !bg-[#282828] !p-5 !rounded-2xl">
                  <div className="flex justify-start mb-3 gap-4">
                    <div className="!bg-[#716D6D] p-1 rounded-2xl items-center">
                      <RocketOutlined className="transform rotate-45 text-4xl !text-white" />
                    </div>
                    <div className="flex justify-start text-[32px] font-bold">{`Sora`}</div>
                  </div>
                  <div className="flex justify-start text-left text-[18px] mb-2">{`Elit eu odio interdum facilisis curabitur mauris phasellus vitae. Pretium fames vel tortor et arcu, faucibus`}</div>
                  <div className="mt-20 flex justify-start">
                    <a type="link" className="text-left p-0 border-b !text-white border-white inline-block">
                      <span className="uppercase font-bold text-xl">{`read more`}</span>
                    </a>
                  </div>
                </Card>
              </div>
              <div className="col col-span-1 w-full !space-y-10 mb-[-50px] mt-[-100px]">
                <Card className="grid grid-cols-1 w-full !bg-[#282828] !p-5 !rounded-2xl">
                  <div className="flex justify-start mb-3 gap-4">
                    <div className="!bg-[#716D6D] p-1 rounded-2xl items-center">
                      <RocketOutlined className="transform rotate-45 text-4xl !text-white" />
                    </div>
                    <div className="flex justify-start text-[32px] font-bold">{`Veo`}</div>
                  </div>
                  <div className="flex justify-start text-left text-[18px] mb-2">{`Elit eu odio interdum facilisis curabitur mauris phasellus vitae. Pretium fames vel tortor et arcu, faucibus`}</div>
                  <div className="mt-20 flex justify-start">
                    <a type="link" className="text-left p-0 border-b !text-white border-white inline-block">
                      <span className="uppercase font-bold text-xl">{`read more`}</span>
                    </a>
                  </div>
                </Card>
                <Card className="grid grid-cols-1 w-full !bg-[#282828] !p-5 !rounded-2xl">
                  <div className="flex justify-start mb-3 gap-4">
                    <div className="!bg-[#716D6D] p-1 rounded-2xl items-center">
                      <RocketOutlined className="transform rotate-45 text-4xl !text-white" />
                    </div>
                    <div className="flex justify-start text-[32px] font-bold">{`Capcut`}</div>
                  </div>
                  <div className="flex justify-start text-left text-[18px] mb-2">{`Elit eu odio interdum facilisis curabitur mauris phasellus vitae. Pretium fames vel tortor et arcu, faucibus`}</div>
                  <div className="mt-20 flex justify-start">
                    <a type="link" className="text-left p-0 border-b !text-white border-white inline-block">
                      <span className="uppercase font-bold text-xl">{`read more`}</span>
                    </a>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* -------------------------------------- */}
      <div className="py-20 flex items-center ">
        <div className="flex animate-marquee whitespace-nowrap text-[100px] text-white items-center">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <span key={i} className="flex items-center gap-5 mr-20">
                <span className="text-white  ">{`The Cave of Creation`}</span>
                <Sparkles className="text-cyan-300 fill-cyan-300 drop-shadow-[0_0_15px_cyan]" />
              </span>
            ))}
        </div>
      </div>
    </>
  );
};

export default Page;
