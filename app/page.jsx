import Image from "next/image";

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/copy_45CB8757-0A23-4CC7-9954-A4C52CCDC18B.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="AesthetX Ways"
            width={200}
            height={67}
            className="mx-auto"
            priority
          />
        </div>

        {/* Coming Soon Text */}
        <div className="mb-12">
          <h2 className="text-lg md:text-xl font-light text-gray-700 mb-2">
            Coming Soon
          </h2>
          <p className="text-gray-600 text-sm">
            We're working on something special. Stay tuned!
          </p>
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-sm">
          © 2025 AesthetX Ways. All rights reserved.
        </p>
      </div>
    </div>
  );
}
