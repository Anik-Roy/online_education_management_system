import NavigationBar from "./parts/NavigationBar";

const Layout = ({ children }) => {
    return (
        <div>
            <NavigationBar />
            {children}
        </div>
    )
}

export default Layout;