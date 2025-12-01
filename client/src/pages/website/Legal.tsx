import WebsiteLayout from "./Layout";

export default function WebsiteLegal() {
  return (
    <WebsiteLayout>
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Mentions Légales</h1>
          <p className="text-slate-600">Conformément aux dispositions de la loi n°2004-575 du 21 juin 2004</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-slate max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Éditeur du site</h2>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-slate-600 leading-relaxed">
                <strong>Raison sociale :</strong> Koomy SAS<br />
                <strong>Forme juridique :</strong> Société par Actions Simplifiée (SAS)<br />
                <strong>Capital social :</strong> 10 000 €<br />
                <strong>Siège social :</strong> 123 Avenue de la République, 75011 Paris, France<br />
                <strong>RCS :</strong> Paris [Numéro à compléter]<br />
                <strong>SIRET :</strong> [Numéro à compléter]<br />
                <strong>Numéro de TVA intracommunautaire :</strong> FR [Numéro à compléter]<br />
                <strong>Directeur de la publication :</strong> [Nom du dirigeant]<br />
                <strong>Email :</strong> contact@koomy.app<br />
                <strong>Téléphone :</strong> +33 1 23 45 67 89
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Hébergeur</h2>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-slate-600 leading-relaxed">
                <strong>Raison sociale :</strong> Replit, Inc.<br />
                <strong>Adresse :</strong> 350 Page Mill Rd, Palo Alto, CA 94306, États-Unis<br />
                <strong>Site web :</strong>{" "}
                <a href="https://replit.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  https://replit.com
                </a>
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Propriété intellectuelle</h2>
            <p className="text-slate-600 leading-relaxed">
              L'ensemble de ce site relève des législations françaises et européennes sur le droit d'auteur et la 
              propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents 
              téléchargeables et les représentations iconographiques et photographiques.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement 
              interdite sauf autorisation expresse du directeur de la publication.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Les marques et logos reproduits sur ce site sont déposés par les sociétés qui en sont propriétaires.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Données personnelles</h2>
            <p className="text-slate-600 leading-relaxed">
              Conformément au Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 
              (Règlement Général sur la Protection des Données - RGPD) et à la loi n°78-17 du 6 janvier 1978 
              relative à l'informatique, aux fichiers et aux libertés, le traitement des données personnelles 
              effectué par Koomy fait l'objet d'une déclaration auprès de la CNIL.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              <strong>Délégué à la Protection des Données (DPO) :</strong><br />
              Email : dpo@koomy.app
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Pour plus d'informations sur le traitement de vos données personnelles, consultez notre{" "}
              <a href="/website/privacy" className="text-blue-600 hover:underline">Politique de Confidentialité</a>.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Cookies</h2>
            <p className="text-slate-600 leading-relaxed">
              Le site koomy.app peut être amené à vous demander l'acceptation des cookies pour des besoins de 
              statistiques et d'affichage. Un cookie est une information déposée sur votre disque dur par le 
              serveur du site que vous visitez.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Il contient plusieurs données qui sont stockées sur votre ordinateur dans un simple fichier texte 
              auquel un serveur accède pour lire et enregistrer des informations. Certaines parties de ce site 
              ne peuvent être fonctionnelles sans l'acceptation de cookies.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Conditions d'utilisation</h2>
            <p className="text-slate-600 leading-relaxed">
              L'utilisation du site koomy.app implique l'acceptation pleine et entière des conditions générales 
              d'utilisation décrites dans nos{" "}
              <a href="/website/terms" className="text-blue-600 hover:underline">Conditions Générales d'Utilisation</a>.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Litiges</h2>
            <p className="text-slate-600 leading-relaxed">
              Les présentes mentions légales sont régies par le droit français. En cas de litige et après échec 
              de toute tentative de recherche d'une solution amiable, les tribunaux français seront seuls compétents.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Conformément aux dispositions du Code de la consommation concernant le règlement amiable des litiges, 
              Koomy adhère au Service du Médiateur. Le service de médiation peut être joint par voie électronique 
              à l'adresse suivante : mediation@koomy.app
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Plateforme européenne de résolution des litiges en ligne :{" "}
              <a 
                href="https://ec.europa.eu/consumers/odr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Crédits</h2>
            <p className="text-slate-600 leading-relaxed">
              <strong>Conception et développement :</strong> Koomy SAS<br />
              <strong>Design :</strong> Koomy SAS<br />
              <strong>Photographies :</strong> Unsplash, stock images libres de droits
            </p>
          </section>

          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 mt-12">
            <h3 className="font-bold text-blue-900 mb-2">Des questions ?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Pour toute question concernant ces mentions légales, n'hésitez pas à nous contacter.
            </p>
            <a href="/website/contact" className="text-blue-600 font-medium hover:underline">
              Contactez-nous →
            </a>
          </div>
        </div>
      </div>
    </WebsiteLayout>
  );
}
