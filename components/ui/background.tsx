export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05060d]">
      <div className="absolute -left-32 -top-24 h-[38rem] w-[38rem] rounded-full bg-[#67efff]/18 blur-[130px]" />
      <div className="absolute right-[-12%] top-[18%] h-[34rem] w-[34rem] rounded-full bg-[#ff4d9a]/16 blur-[130px]" />
      <div className="absolute bottom-[-18%] left-[28%] h-[36rem] w-[36rem] rounded-full bg-[#8b6cff]/20 blur-[140px]" />
      <div className="absolute left-[55%] top-[8%] h-64 w-64 rounded-full bg-[#ffb020]/10 blur-[100px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,6,13,0.55)_58%,#05060d_100%)]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
    </div>
  );
}
