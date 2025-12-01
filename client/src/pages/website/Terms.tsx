import WebsiteLayout from "./Layout";

export default function WebsiteTerms() {
  return (
    <WebsiteLayout>
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Conditions Générales d'Utilisation</h1>
          <p className="text-slate-600">Dernière mise à jour : 1er décembre 2025</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-slate max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Objet</h2>
            <p className="text-slate-600 leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (ci-après "CGU") ont pour objet de définir les modalités 
              et conditions d'utilisation des services proposés par Koomy (ci-après "le Service"), ainsi que de définir 
              les droits et obligations des parties dans ce cadre.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Elles sont accessibles et imprimables à tout moment par un lien direct en bas de la page d'accueil du site.
              Elles peuvent être complétées, le cas échéant, par des conditions d'utilisation particulières à certains services, 
              lesquelles complètent les présentes CGU et, en cas de contradiction, prévalent sur ces dernières.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Exploitant du Service</h2>
            <p className="text-slate-600 leading-relaxed">
              Le Service est exploité par Koomy SAS, société par actions simplifiée au capital de 10 000 euros, 
              immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro [À COMPLÉTER], 
              dont le siège social est situé au 123 Avenue de la République, 75011 Paris, France.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mt-4">
              <p className="text-slate-600">
                <strong>Contact :</strong> contact@koomy.app<br />
                <strong>Téléphone :</strong> +33 1 23 45 67 89<br />
                <strong>Directeur de la publication :</strong> [À COMPLÉTER]
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Accès au Service</h2>
            <p className="text-slate-600 leading-relaxed">
              Le Service est accessible gratuitement à tout utilisateur disposant d'un accès à Internet. 
              Tous les coûts afférents à l'accès au Service, que ce soient les frais matériels, logiciels ou 
              d'accès à Internet sont exclusivement à la charge de l'utilisateur.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              L'utilisateur non membre n'a pas accès aux services réservés aux membres. Pour cela, il doit s'inscrire 
              en remplissant le formulaire disponible sur le site. En acceptant de s'inscrire aux services réservés, 
              l'utilisateur membre s'engage à fournir des informations sincères et exactes concernant son état civil 
              et ses coordonnées, notamment son adresse email.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Données personnelles</h2>
            <p className="text-slate-600 leading-relaxed">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, 
              l'utilisateur dispose d'un droit d'accès, de rectification, d'effacement, de limitation, de portabilité 
              et d'opposition au traitement de ses données personnelles.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Pour exercer ces droits, l'utilisateur peut contacter Koomy à l'adresse suivante : dpo@koomy.app
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Pour plus d'informations sur le traitement de vos données personnelles, veuillez consulter notre{" "}
              <a href="/website/privacy" className="text-blue-600 hover:underline">Politique de Confidentialité</a>.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Propriété intellectuelle</h2>
            <p className="text-slate-600 leading-relaxed">
              Les marques, logos, signes et tout autre contenu du site font l'objet d'une protection par le Code 
              de la propriété intellectuelle et plus particulièrement par le droit d'auteur.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              L'utilisateur sollicite l'autorisation préalable du site pour toute reproduction, publication, copie 
              des différents contenus. L'utilisateur s'engage à une utilisation des contenus du site dans un cadre 
              strictement privé. Une utilisation des contenus à des fins commerciales est strictement interdite.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Responsabilité</h2>
            <p className="text-slate-600 leading-relaxed">
              Koomy s'efforce de fournir sur le site des informations aussi précises que possible. Toutefois, elle ne 
              pourra être tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, 
              qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Koomy décline toute responsabilité en cas d'interruption ou d'inaccessibilité du Service, de survenance 
              de bogues ou de tout dommage résultant d'une intrusion frauduleuse d'un tiers.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Liens hypertextes</h2>
            <p className="text-slate-600 leading-relaxed">
              Le site peut contenir des liens hypertextes vers d'autres sites internet ou ressources. Koomy n'a pas 
              la possibilité de vérifier le contenu de ces sites extérieurs et n'assume de ce fait aucune responsabilité 
              de ce chef.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Cookies</h2>
            <p className="text-slate-600 leading-relaxed">
              L'utilisateur est informé que lors de ses visites sur le site, un ou des cookies peuvent s'installer 
              automatiquement sur son logiciel de navigation. Un cookie est un élément qui ne permet pas d'identifier 
              l'utilisateur mais sert à enregistrer des informations relatives à la navigation de celui-ci sur le site.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              L'utilisateur peut désactiver ces cookies par l'intermédiaire des paramètres de son logiciel de navigation. 
              Toutefois, la désactivation de ces cookies peut empêcher l'utilisateur d'accéder à certaines fonctionnalités du Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Droit applicable et juridiction compétente</h2>
            <p className="text-slate-600 leading-relaxed">
              Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux français seront 
              seuls compétents.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Conformément à l'article 14.1 du Règlement (UE) n°524/2013, l'utilisateur est informé qu'il peut recourir 
              à une procédure de médiation conventionnelle ou à tout autre mode alternatif de règlement des différends. 
              Le lien vers la plateforme européenne de résolution des litiges en ligne est le suivant :{" "}
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Modifications des CGU</h2>
            <p className="text-slate-600 leading-relaxed">
              Koomy se réserve le droit de modifier les présentes CGU à tout moment. L'utilisateur sera informé de 
              ces modifications par tout moyen utile. L'utilisateur qui n'accepte pas les CGU modifiées doit se 
              désinscrire des services. Tout utilisateur qui a recours aux services postérieurement à l'entrée en 
              vigueur des CGU modifiées est réputé avoir accepté ces modifications.
            </p>
          </section>

          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 mt-12">
            <h3 className="font-bold text-blue-900 mb-2">Des questions ?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Pour toute question concernant ces conditions, n'hésitez pas à nous contacter.
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
