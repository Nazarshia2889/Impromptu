"use client";
import { useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const LandingPage = () => {
  useEffect(() => {
    const svgElement = document.getElementById("background-svg");
    if (svgElement) {
      const elements = svgElement.querySelectorAll("polygon");

      // Function to make each hexagon move smoothly and randomly
      elements.forEach((element) => {
        const randomMovement = () => {
          const moveX = Math.random() * 4000 - 2000; // Larger screen simulation
          const moveY = Math.random() * 3000 - 1500; // Larger screen simulation
          const duration = 20000 + Math.random() * 10000; // Duration between 15-20 seconds to slow down the fastest hexagons

          element.animate(
            [
              { transform: element.style.transform },
              {
                transform: `translate(${moveX}px, ${moveY}px) rotate(${element.dataset.rotation}deg)`,
              },
            ],
            {
              duration: duration, // Slower movement
              easing: "ease-in-out",
              iterations: Infinity,
            }
          );
        };
        randomMovement();
      });
    }
  }, []);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  return (
    <div className=" flex flex-col justify-between min-h-screen text-center bg-tan-100 text-gray-800 overflow-hidden">
      <header className="flex justify-between items-center px-8 py-6">
        <div className="text-3xl font-extrabold text-gray-900 font-sans">
          Impromptu 🗣️🗣️🗣️
        </div>
        <nav className="flex gap-8">
          <a
            href="#features"
            className="text-lg font-medium hover:text-gray-600 transition-colors duration-300 font-sans"
          >
            Features
          </a>
          <a
            href="#about"
            className="text-lg font-medium hover:text-gray-600 transition-colors duration-300 font-sans"
          >
            About
          </a>
          <a
            href="#contact"
            className="text-lg font-medium hover:text-gray-600 transition-colors duration-300 font-sans"
          >
            Contact
          </a>
        </nav>
      </header>

      <section className="flex flex-col items-center justify-center flex-grow relative py-24 min-h-[70vh]">
        <div className="absolute inset-0 opacity-20">
          <svg
            id="background-svg"
            className="w-full h-full transition-transform duration-200 ease-out"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="gray"
            strokeWidth="2"
          >
            <g>
              {[...Array(50)].map((_, i) => {
                const size = 100 + Math.random() * 600;
                const rotation = Math.random() * 360;
                return (
                  <polygon
                    key={i}
                    points={`${size / 2},0 ${size},${size / 4} ${size},${
                      (size / 4) * 3
                    } ${size / 2},${size} 0,${(size / 4) * 3} 0,${size / 4}`}
                    fill="none"
                    data-rotation={rotation}
                    style={{
                      transform: `translate(${Math.random() * 4000 - 2000}px, ${
                        Math.random() * 3000 - 1500
                      }px) rotate(${rotation}deg)`,
                      opacity: 0.6,
                    }}
                  />
                );
              })}
            </g>
          </svg>
        </div>
        <h1 className="text-7xl font-bold mb-12 leading-tight z-10 text-gray-900 font-sans">
          Speak Boldly
        </h1>
        <p className="text-2xl font-light mb-16 max-w-2xl z-10 font-sans">
          Transform your impromptu speaking skills with real-time insights and
          thoughtful prompts.
        </p>
        <div className="flex space-x-6">
          <button
            className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 px-12 rounded-lg shadow-lg transition-transform transform hover:scale-105 z-10 text-xl"
            onClick={() => (window.location.href = "/")}
          >
            Get Started Now
          </button>
          <button
            className="bg-white hover:bg-sky-50 text-sky-500 font-bold py-4 px-12 rounded-lg shadow-lg transition-transform transform hover:scale-105 z-10 border-2 border-sky-500 text-xl"
            onClick={() => (window.location.href = "/")}
          >
            Learn More
          </button>
        </div>
      </section>

      <section id="features" className="bg-gray-100 py-24 px-8">
        <h2 className="text-4xl font-bold mb-12 text-gray-900 font-sans">Our Features</h2>
        <Slider {...carouselSettings} className="max-w-4xl mx-auto">
          <div className="px-4">
            <img
              src="/gemini-suggestions.gif"
              alt="Gemini-Powered Suggestions"
              className="w-3/4 h-[450px] object-cover rounded-lg mb-4 mx-auto"
            />
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">Gemini-Powered Suggestions</h3>
            <p className="text-gray-600">
              Receive intelligent suggestions and insights from our Gemini AI, based on your speech notes, to enhance your impromptu speaking performance and content delivery.
            </p>
          </div>
          <div className="px-4">
            <img
              src="/topic-generator.gif"
              alt="Dynamic Topic Generator"
              className="w-3/4 h-[450px] object-cover rounded-lg mb-4 mx-auto"
            />
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">Dynamic Topic Generator</h3>
            <p className="text-gray-600">
              Challenge yourself with our intelligent topic generator, designed to provide thought-provoking subjects tailored to your skill level and interests.
            </p>
          </div>
          <div className="px-4">
            <img
              src="/temp.png"
              alt="Real-time Judge Feedback"
              className="w-3/4 h-[450px] object-cover rounded-lg mb-4 mx-auto"
            />
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">Real-time Judge Feedback</h3>
            <p className="text-gray-600">
              Engage in dynamic conversations with AI judges who provide immediate, constructive feedback on your impromptu speeches, simulating real-world speaking scenarios.
            </p>
          </div>
        </Slider>
      </section>
    </div>
  );
};

export default LandingPage;
