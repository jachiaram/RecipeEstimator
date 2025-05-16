import './Button.css';

interface ButtonProps {
	loading?: boolean;
	onClick?: () => void;
	title: string;
}

export default function Button({
	loading,
	onClick,
	title,
}: ButtonProps) {
	return (
		<button className='button'
		onClick={onClick}>{loading ? 'Loading' : title}</button>
	);
}
