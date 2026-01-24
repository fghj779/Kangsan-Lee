export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display font-bold text-xl mb-4">SportOnboard</h3>
            <p className="text-gray-400">
              Your gateway to discovering and loving sports teams around the world.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Sports</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Basketball (NBA)</li>
              <li>Soccer</li>
              <li>Baseball (MLB)</li>
              <li>Formula 1</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Learn</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Interactive Rules</li>
              <li>Player Stories</li>
              <li>Team Culture</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Get Started</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Take the Quiz</li>
              <li>Find Your Team</li>
              <li>Follow Stars</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 SportOnboard. Built with passion for sports fans.</p>
        </div>
      </div>
    </footer>
  );
}
