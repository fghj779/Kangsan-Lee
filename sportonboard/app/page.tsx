import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6">
            Discover Your
            <span className="text-primary"> Perfect Sports Team</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            From NBA to Soccer, F1 to Cricket—find teams that match your personality, learn the rules through
            interactive visualizations, and meet the stars that make sports magical.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/onboarding"
              className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition shadow-lg"
            >
              Start Your Journey
            </Link>
            <Link
              href="/sports"
              className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
            >
              Explore Sports
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Sports */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-display font-bold text-center mb-12">8 Sports, Endless Excitement</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['NBA', 'Soccer', 'MLB', 'F1', 'NFL', 'Cricket', 'Tennis', 'NHL'].map((sport) => (
            <div
              key={sport}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition text-center cursor-pointer"
            >
              <div className="text-4xl mb-2">🏀⚽⚾🏎️🏈🏏🎾🏒'.charAt(['NBA', 'Soccer', 'MLB', 'F1', 'NFL', 'Cricket', 'Tennis', 'NHL'].indexOf(sport))</div>
              <h3 className="font-semibold text-lg">{sport}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-center mb-12">How SportOnboard Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Take the Quiz</h3>
              <p className="text-gray-600">
                Answer questions about your preferences, personality, and what excites you about sports.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Get Recommendations</h3>
              <p className="text-gray-600">
                Our smart algorithm matches you with teams that fit your style—complete with explanations.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Learn & Follow</h3>
              <p className="text-gray-600">
                Explore interactive rule guides, meet star players, and immerse yourself in team culture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-display font-bold mb-6">Ready to Find Your Team?</h2>
        <p className="text-xl text-gray-600 mb-8">Join thousands of fans discovering their sports passion.</p>
        <Link
          href="/onboarding"
          className="inline-block bg-primary text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition shadow-lg"
        >
          Take the 2-Minute Quiz
        </Link>
      </section>
    </div>
  );
}
