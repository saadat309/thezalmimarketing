
const Footer = () => {
  return (
    <footer className="w-full shadow-md bg-card text-card-foreground">
        <div className="container px-4 py-4 mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} The Zalmi Marketing. All Rights Reserved.</p>
        </div>
      </footer>
  )
}

Footer.propTypes = {}

export default Footer;