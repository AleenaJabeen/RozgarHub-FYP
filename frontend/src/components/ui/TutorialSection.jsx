import React from "react";

const TutorialSection = () => {
  return (
    <section className="w-full bg-primary py-20">
      <div className="w-[95%] mx-auto">
        
        {/* Heading */}
        <div className="mb-10">
          <h2 className="text-4xl font-semibold text-tertiary mb-4">
            How <span className="text-secondary font-bold">RozgarHub</span> Works:Tutorial
          </h2>
          <p className="text-slate-400 text-lg">
            Watch a quick guide on how to hire or start earning locally.
          </p>
        </div>

        {/* Video Container */}
        <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          <div className="relative w-full h-0 pb-[56.25%]"> {/* 16:9 ratio */}
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/oafxkMv4xnc?si=D0CFoJ-C_nD86gbr"
              title="Rozgar Hub Tutorial Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TutorialSection;