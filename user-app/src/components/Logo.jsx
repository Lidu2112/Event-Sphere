export default function Logo({ size = 36 }) {
    return (
        <img
            src="https://static.vecteezy.com/system/resources/thumbnails/043/211/173/small/people-gathered-in-front-of-a-blue-and-orange-logo-develop-a-clean-elegant-logo-for-a-conference-management-firm-free-vector.jpg"
            alt="EventSphere Logo"
            width={size}
            height={size}
            style={{
                borderRadius: '8px',
                objectFit: 'cover',
                display: 'block',
            }}
        />
    );
}
