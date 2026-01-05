"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RulesPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("objectif");

  const sections = [
    { id: "objectif", title: "🎯 Objectif", icon: "🎯" },
    { id: "preparation", title: "🎲 Préparation", icon: "🎲" },
    { id: "cartes", title: "🃏 Les Cartes", icon: "🃏" },
    { id: "deroulement", title: "⚙️ Déroulement", icon: "⚙️" },
    { id: "victoire", title: "🏆 Victoire", icon: "🏆" },
  ];

  return (
    <div className="min-h-screen animated-gradient">
      {/* Header */}
      <div className="glass border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold gradient-text">Règles du Tock</h1>
            </div>
            <button
              onClick={() => router.push("/lobby/new")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover-lift"
            >
              Jouer maintenant
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation latérale */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Sommaire</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      activeSection === section.id
                        ? "bg-indigo-600 text-white shadow-md"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.title.split(" ").slice(1).join(" ")}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3 space-y-8">
            {/* Objectif */}
            {activeSection === "objectif" && (
              <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Objectif du jeu</h2>
                </div>
                
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p className="text-lg leading-relaxed">
                    Le Tock est un jeu de parcours captivant qui se joue en équipe de 2 contre 2.
                  </p>
                  
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl p-6">
                    <p className="font-semibold text-indigo-900 dark:text-indigo-200 text-lg">
                      🏁 But du jeu : Être la première équipe à faire rentrer tous ses pions dans leur zone d'arrivée !
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-800 rounded-xl p-4">
                      <div className="text-3xl mb-2">👥</div>
                      <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">4 Joueurs</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-300">2 équipes de 2 joueurs</p>
                    </div>
                    
                    <div className="bg-green-100 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 rounded-xl p-4">
                      <div className="text-3xl mb-2">🎮</div>
                      <h3 className="font-bold text-green-900 dark:text-green-200 mb-2">4 Pions par joueur</h3>
                      <p className="text-sm text-green-800 dark:text-green-300">Soit 8 pions par équipe</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Préparation */}
            {activeSection === "preparation" && (
              <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎲</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Préparation de la partie</h2>
                </div>
                
                <div className="space-y-6 text-gray-700 dark:text-gray-300">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Placement des joueurs</h3>
                        <p>Les partenaires se placent en face à face. Les équipes sont alternées autour du plateau.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Position de départ</h3>
                        <p>Chaque joueur place ses 4 pions dans sa base (zone de départ).</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Distribution des cartes</h3>
                        <p>On utilise un jeu de 52 cartes standard. Chaque joueur reçoit 5 cartes au début de chaque manche.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <h4 className="font-bold text-yellow-900 dark:text-yellow-200 mb-1">Astuce</h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          Les équipes sont formées avant le début de la partie. La stratégie d'équipe est essentielle !
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Les Cartes */}
            {activeSection === "cartes" && (
              <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🃏</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Les Cartes et leurs effets</h2>
                </div>
                
                <div className="grid gap-4">
                  {/* As et Roi */}
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-800 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">👑</span>
                      <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200">As (A) et Roi (K)</h3>
                    </div>
                    <p className="text-blue-800 dark:text-blue-300 mb-2">
                      <strong>Double fonction :</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-300 ml-4">
                      <li>Sortir un pion de la base</li>
                      <li>OU avancer de 1 case (As) / 13 cases (Roi)</li>
                    </ul>
                  </div>

                  {/* 2, 3, 6, 8, 9, 10, Dame */}
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-800 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">➡️</span>
                      <h3 className="text-xl font-bold text-green-900 dark:text-green-200">2, 3, 6, 8, 9, 10, Dame (Q)</h3>
                    </div>
                    <p className="text-green-800 dark:text-green-300">
                      <strong>Avancement simple :</strong> Avancent du nombre de cases correspondant (Dame = 12 cases)
                    </p>
                  </div>

                  {/* 4 */}
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-800 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">⬅️</span>
                      <h3 className="text-xl font-bold text-orange-900 dark:text-orange-200">4</h3>
                    </div>
                    <p className="text-orange-800 dark:text-orange-300">
                      <strong>Marche arrière :</strong> Recule de 4 cases. Peut capturer des pions adverses !
                    </p>
                  </div>

                  {/* 5 */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-800 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">✨</span>
                      <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200">5</h3>
                    </div>
                    <p className="text-purple-800 dark:text-purple-300">
                      <strong>Carte universelle :</strong> Peut déplacer N'IMPORTE QUEL pion sur le plateau de 5 cases (même un pion adverse !)
                    </p>
                  </div>

                  {/* 7 */}
                  <div className="bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">🎯</span>
                      <h3 className="text-xl font-bold text-red-900 dark:text-red-200">7</h3>
                    </div>
                    <p className="text-red-800 dark:text-red-300 mb-2">
                      <strong>Carte stratégique :</strong> Répartir 7 mouvements entre vos pions
                    </p>
                    <div className="bg-red-200 dark:bg-red-900/40 border border-red-400 dark:border-red-700 rounded-lg p-3 mt-2">
                      <p className="text-sm text-red-900 dark:text-red-200 font-semibold">
                        ⚠️ Le 7 capture TOUS les pions sur son passage !
                      </p>
                    </div>
                  </div>

                  {/* Valet */}
                  <div className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-800 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">🔄</span>
                      <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200">Valet (J)</h3>
                    </div>
                    <p className="text-yellow-800 dark:text-yellow-300">
                      <strong>Échange :</strong> Échange la position de deux pions sur le plateau (le vôtre avec n'importe quel autre)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Déroulement */}
            {activeSection === "deroulement" && (
              <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Déroulement de la partie</h2>
                </div>
                
                <div className="space-y-6 text-gray-700 dark:text-gray-300">
                  <div className="space-y-4">
                    <div className="bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-800 rounded-xl p-5">
                      <h3 className="font-bold text-lg mb-3 text-blue-900 dark:text-blue-200">🔄 Tour par tour</h3>
                      <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-300">
                        <li>Le joueur actif sélectionne une carte de sa main</li>
                        <li>Il choisit le pion à déplacer selon les règles de la carte</li>
                        <li>Le pion se déplace et capture éventuellement un pion adverse</li>
                        <li>Le tour passe au joueur suivant (sens horaire)</li>
                      </ol>
                    </div>

                    <div className="bg-green-100 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 rounded-xl p-5">
                      <h3 className="font-bold text-lg mb-3 text-green-900 dark:text-green-200">🎯 Captures</h3>
                      <p className="text-green-800 dark:text-green-300">
                        Si votre pion arrive sur une case occupée par un pion adverse, ce dernier retourne à sa base. 
                        Les pions d'équipe ne peuvent pas se capturer entre eux.
                      </p>
                    </div>

                    <div className="bg-purple-100 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-800 rounded-xl p-5">
                      <h3 className="font-bold text-lg mb-3 text-purple-900 dark:text-purple-200">🏠 Zone d'arrivée (HOME)</h3>
                      <ul className="list-disc list-inside space-y-2 text-purple-800 dark:text-purple-300">
                        <li>Chaque joueur a sa propre zone d'arrivée de 4 cases</li>
                        <li>Les pions entrent dans cette zone après avoir fait le tour du plateau</li>
                        <li>Une fois dans la zone HOME, les pions ne peuvent plus en sortir</li>
                        <li>Il faut un compte exact pour atteindre la dernière case</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-800 rounded-xl p-5">
                      <h3 className="font-bold text-lg mb-3 text-yellow-900 dark:text-yellow-200">🚫 Passer son tour</h3>
                      <p className="text-yellow-800 dark:text-yellow-300">
                        Si vous ne pouvez jouer aucune carte, vous devez en défausser une et passer votre tour.
                      </p>
                    </div>

                    <div className="bg-red-100 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl p-5">
                      <h3 className="font-bold text-lg mb-3 text-red-900 dark:text-red-200">🔄 Nouvelle manche</h3>
                      <p className="text-red-800 dark:text-red-300">
                        Quand tous les joueurs ont joué leurs 5 cartes, une nouvelle manche commence avec une nouvelle distribution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Victoire */}
            {activeSection === "victoire" && (
              <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Conditions de victoire</h2>
                </div>
                
                <div className="space-y-6 text-gray-700 dark:text-gray-300">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-4 border-yellow-400 dark:border-yellow-600 rounded-2xl p-8 text-center">
                    <div className="text-6xl mb-4 animate-bounce">🏆</div>
                    <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mb-4">
                      La première équipe qui place tous ses 8 pions (4 par joueur) dans les zones d'arrivée gagne la partie !
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-100 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 rounded-xl p-5">
                      <div className="text-3xl mb-3">✅</div>
                      <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">Stratégie d'équipe</h4>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        Collaborez avec votre partenaire pour bloquer les adversaires et sécuriser vos pions.
                      </p>
                    </div>

                    <div className="bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-800 rounded-xl p-5">
                      <div className="text-3xl mb-3">🎲</div>
                      <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Gestion des cartes</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Utilisez vos cartes stratégiquement. Le timing est crucial !
                      </p>
                    </div>

                    <div className="bg-purple-100 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-800 rounded-xl p-5">
                      <div className="text-3xl mb-3">🛡️</div>
                      <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">Protection</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">
                        Protégez vos pions avancés et gênez la progression adverse.
                      </p>
                    </div>

                    <div className="bg-orange-100 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-800 rounded-xl p-5">
                      <div className="text-3xl mb-3">⚡</div>
                      <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-2">Opportunisme</h4>
                      <p className="text-sm text-orange-800 dark:text-orange-300">
                        Saisissez les opportunités de capturer les pions adverses clés.
                      </p>
                    </div>
                  </div>

                  <div className="bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl p-6 text-center">
                    <p className="text-lg font-semibold text-indigo-900 dark:text-indigo-200">
                      Prêt à jouer ? Lancez votre première partie maintenant !
                    </p>
                    <button
                      onClick={() => router.push("/lobby/new")}
                      className="mt-4 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover-lift"
                    >
                      Créer une partie 🎮
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

