import WebsiteLayout from "./Layout";

export default function WebsitePrivacy() {
  return (
    <WebsiteLayout>
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Politique de Confidentialité</h1>
          <p className="text-slate-600">Dernière mise à jour : 1er décembre 2025</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-slate max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Introduction</h2>
            <p className="text-slate-600 leading-relaxed">
              Koomy SAS (ci-après "Koomy", "nous", "notre") s'engage à protéger la vie privée de ses utilisateurs. 
              La présente politique de confidentialité décrit comment nous collectons, utilisons, stockons et 
              protégeons vos données personnelles conformément au Règlement Général sur la Protection des Données 
              (RGPD - Règlement UE 2016/679) et à la loi française Informatique et Libertés.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Responsable du traitement</h2>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-slate-600">
                <strong>Koomy SAS</strong><br />
                123 Avenue de la République<br />
                75011 Paris, France<br />
                Email : dpo@koomy.app<br />
                Téléphone : +33 1 23 45 67 89
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Données collectées</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Nous collectons différentes catégories de données personnelles :
            </p>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Données d'identification</h3>
                <p className="text-slate-600 text-sm">
                  Nom, prénom, adresse email, numéro de téléphone, adresse postale
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Données de connexion</h3>
                <p className="text-slate-600 text-sm">
                  Adresse IP, type de navigateur, pages visitées, durée de visite
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Données de paiement</h3>
                <p className="text-slate-600 text-sm">
                  Informations de facturation (traitées par nos prestataires de paiement certifiés PCI-DSS)
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Données d'adhésion</h3>
                <p className="text-slate-600 text-sm">
                  Informations relatives à votre appartenance à une communauté, statut de cotisation
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Finalités du traitement</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Vos données sont traitées pour les finalités suivantes :
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li>Gestion de votre compte utilisateur et de vos adhésions</li>
              <li>Fourniture et amélioration de nos services</li>
              <li>Communication avec vous (notifications, actualités, support)</li>
              <li>Facturation et gestion des paiements</li>
              <li>Respect de nos obligations légales</li>
              <li>Analyse statistique et amélioration de l'expérience utilisateur</li>
              <li>Prévention de la fraude et sécurité</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Base légale du traitement</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Nous traitons vos données personnelles sur les bases légales suivantes :
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li><strong>Exécution du contrat :</strong> pour vous fournir nos services</li>
              <li><strong>Consentement :</strong> pour l'envoi de communications marketing</li>
              <li><strong>Intérêt légitime :</strong> pour améliorer nos services et prévenir la fraude</li>
              <li><strong>Obligation légale :</strong> pour respecter nos obligations fiscales et légales</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Durée de conservation</h2>
            <p className="text-slate-600 leading-relaxed">
              Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités 
              pour lesquelles elles ont été collectées :
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 mt-4">
              <li>Données de compte : pendant la durée de votre inscription + 3 ans</li>
              <li>Données de facturation : 10 ans (obligation légale)</li>
              <li>Données de connexion : 1 an</li>
              <li>Cookies : selon leur type (session ou 13 mois maximum)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Vos droits</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-1">Droit d'accès</h3>
                <p className="text-blue-700 text-sm">Obtenir une copie de vos données</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-1">Droit de rectification</h3>
                <p className="text-blue-700 text-sm">Corriger vos données inexactes</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-1">Droit à l'effacement</h3>
                <p className="text-blue-700 text-sm">Demander la suppression de vos données</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-1">Droit à la portabilité</h3>
                <p className="text-blue-700 text-sm">Récupérer vos données dans un format standard</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-1">Droit d'opposition</h3>
                <p className="text-blue-700 text-sm">Vous opposer à certains traitements</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-1">Droit de limitation</h3>
                <p className="text-blue-700 text-sm">Limiter le traitement de vos données</p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mt-4">
              Pour exercer ces droits, contactez notre DPO à : <strong>dpo@koomy.app</strong>
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Transferts de données</h2>
            <p className="text-slate-600 leading-relaxed">
              Vos données peuvent être transférées vers des pays situés hors de l'Union Européenne. Dans ce cas, 
              nous nous assurons que des garanties appropriées sont mises en place (clauses contractuelles types 
              de la Commission européenne, certification Privacy Shield, etc.).
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Sécurité</h2>
            <p className="text-slate-600 leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos 
              données personnelles contre la destruction accidentelle ou illicite, la perte, l'altération, 
              la divulgation ou l'accès non autorisé.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Ces mesures incluent : chiffrement des données, contrôles d'accès, sauvegardes régulières, 
              formation du personnel, audits de sécurité.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Cookies</h2>
            <p className="text-slate-600 leading-relaxed">
              Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez à tout moment 
              configurer vos préférences en matière de cookies via les paramètres de votre navigateur.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Types de cookies utilisés :
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 mt-2">
              <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
              <li><strong>Cookies analytiques :</strong> pour comprendre l'utilisation du site</li>
              <li><strong>Cookies de préférences :</strong> pour mémoriser vos choix</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Réclamation</h2>
            <p className="text-slate-600 leading-relaxed">
              Si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD, 
              vous avez le droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de 
              l'Informatique et des Libertés) :
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mt-4">
              <p className="text-slate-600">
                <strong>CNIL</strong><br />
                3 Place de Fontenoy, TSA 80715<br />
                75334 Paris Cedex 07<br />
                Site web :{" "}
                <a 
                  href="https://www.cnil.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  www.cnil.fr
                </a>
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Modifications</h2>
            <p className="text-slate-600 leading-relaxed">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
              Toute modification sera publiée sur cette page avec une date de mise à jour actualisée. 
              Nous vous encourageons à consulter régulièrement cette page.
            </p>
          </section>

          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 mt-12">
            <h3 className="font-bold text-blue-900 mb-2">Des questions sur vos données ?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Notre Délégué à la Protection des Données est à votre disposition pour répondre à toutes vos questions.
            </p>
            <a href="mailto:dpo@koomy.app" className="text-blue-600 font-medium hover:underline">
              Contacter le DPO : dpo@koomy.app →
            </a>
          </div>
        </div>
      </div>
    </WebsiteLayout>
  );
}
