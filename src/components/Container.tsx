interface ContainerProps {
    children: React.ReactNode;
    wide?: boolean;
}

export default function Container({ children, wide } : ContainerProps) {
    return (
        <div className={wide ? 'container-wide' : 'container'}>
            {children}
        </div>
    );
}
