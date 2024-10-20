'use client';
import { useEffect } from 'react';

const LandingPage = () => {
	useEffect(() => {
		const svgElement = document.getElementById('background-svg');
		if (svgElement) {
			const elements = svgElement.querySelectorAll('polygon');

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
							easing: 'ease-in-out',
							iterations: Infinity,
						}
					);
				};
				randomMovement();
			});
		}
	}, []);

	return (
		<div className='flex flex-col justify-between min-h-screen px-8 py-4 text-center bg-tan-100 text-gray-800 overflow-hidden'>
			<header className='flex justify-between items-center px-8 py-6'>
				<div className='text-3xl font-extrabold text-gray-900 font-sans'>Impromptu</div>
				<nav className='flex gap-8'>
					<a
						href='#features'
						className='text-lg font-medium hover:text-gray-600 transition-colors duration-300 font-sans'
					>
						Features
					</a>
					<a
						href='#about'
						className='text-lg font-medium hover:text-gray-600 transition-colors duration-300 font-sans'
					>
						About
					</a>
					<a
						href='#contact'
						className='text-lg font-medium hover:text-gray-600 transition-colors duration-300 font-sans'
					>
						Contact
					</a>
				</nav>
			</header>

			<section className='flex flex-col items-center justify-center flex-grow relative'>
				<div className='absolute inset-0 opacity-20'>
					<svg
						id='background-svg'
						className='w-full h-full transition-transform duration-200 ease-out'
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						stroke='gray'
						strokeWidth='2'
					>
						<g>
							{[...Array(50)].map((_, i) => {
								const size = 100 + Math.random() * 600;
								const rotation = Math.random() * 360;
								return (
									<polygon
										key={i}
										points={`${size / 2},0 ${size},${size / 4} ${size},${(size / 4) * 3} ${
											size / 2
										},${size} 0,${(size / 4) * 3} 0,${size / 4}`}
										fill='none'
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
				<h1 className='text-6xl font-bold mb-8 leading-tight z-10 text-gray-900 font-sans'>
					Speak Boldly
				</h1>
				<p className='text-xl font-light mb-12 max-w-xl z-10 font-sans'>
					Transform your impromptu speaking skills with real-time insights and thoughtful prompts.
				</p>
				<button
					className='bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-transform transform hover:scale-105 z-10'
					onClick={() => (window.location.href = '/')}
				>
					Get Started Now
				</button>
			</section>
		</div>
	);
};

export default LandingPage;
