const Button = ({ onClick, disabled, children, styles }) => {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`w-full py-2 rounded focus:outline-none ${styles}`}
		>
			{children}
		</button>
	);
};

export default Button;
