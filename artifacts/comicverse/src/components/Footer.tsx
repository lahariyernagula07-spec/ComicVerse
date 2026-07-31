export default function Footer() {
  return (
    <footer
      id="about"
      className="border-t border-purple-900/40 bg-[#090612] px-6 py-12 text-white lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">

        <div>
          <h2 className="text-2xl font-black text-white">
            COMICVERSE
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
            Create your own comic universe with AI-powered storytelling,
            artwork, and character creation.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white">
            Quick Links
          </h3>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <a href="#home" className="text-gray-400 hover:text-purple-400">
              Home
            </a>

            <a href="#features" className="text-gray-400 hover:text-purple-400">
              Features
            </a>

            <a href="#community" className="text-gray-400 hover:text-purple-400">
              Community
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white">
            ComicVerse
          </h3>

          <p className="mt-4 text-sm leading-6 text-gray-400">
            Your imagination.
            <br />
            Your characters.
            <br />
            Your universe.
          </p>
        </div>

      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-purple-900/30 pt-6 text-center text-sm text-gray-500">
        © 2026 ComicVerse. All rights reserved.
      </div>
    </footer>
  );
}