# Expression de table (cte)
<!-- .element style="text-shadow: 4px 4px 2px rgba(255, 255, 255, 0.54);" -->

## `WITH` et `WITH RECURSIVE`
<!-- .element style="text-shadow: 4px 4px 2px rgba(255, 255, 255, 0.54);" -->

<!-- .slide: data-background="/images/cte/romanesco.jpg" -->




### Expression de table (CTE)

Une expression de table consiste à exprimer une requête **`SELECT`** que l'on considérera comme une une table dans la requête qui suivra cette expression.

Similaire à une vue, mais *dynamique* (non persistant).

```
WITH <nom_requete> (liste_colonne)
  AS ( <requete_select> )
SELECT ... FROM ..., <nom_requete>
```
<!-- .element class="blockquote no-margin w-100" data-db="CONTACTS" -->

CTE: Common Table Expression
<!-- .element class="small bottom left" -->




### Utilisation

* Permet de simplifier certaines requêtes
* Indispensable pour permettre un traitement récursif des données de la requête
* Une sous-requête peut désormais utiliser la requête principale.

L'opérateur **`WITH`** permet de programmer la récursivité d'une manière plus efficace que la clause **`CONNECT BY`** et est disponible dans Oracle depuis 11g release 2.

* provides depth-first search and breadth-first search
* supports multiple recursive branches

note:
 "subquery_factoring_clause, which supports recursive subquery factoring (recursive WITH) and lets you query hierarchical data. This feature is more powerful than CONNECT BY in that it provides depth-first search and breadth-first search, and supports multiple recursive branches."
 https://docs.oracle.com/database/121/SQLRF/queries003.htm#SQLRF52332




### Expression simple: `WITH`

Il est possible de définir plusieurs expressions de tables.
```
WITH
<nom_requete1> (liste_colonne)
AS ( <requete_select1> ),
<nom_requete2> (liste_colonne)
AS ( <requete_select2> ),
...
SELECT ...
```
<!-- .element class="blockquote no-margin w-100" -->




### Example `WITH` simple

Afficher les provinces qui ont plus de contacts que la province qui ont a le moins.

```sql
SELECT Province, COUNT(*)
  FROM Contacts
 GROUP BY Province
HAVING COUNT(*) > (
    SELECT MIN(COUNT(*))
      FROM Contacts
     GROUP BY Province
);
```
<!-- .element class="fragment float-left w-40 top right" data-db="CONTACTS" data-title="requête sans WITH" -->

```sql
WITH contactsByP(province, nb)
AS ( SELECT Province, COUNT(*)
       FROM Contacts
      GROUP BY Province)
      
SELECT * FROM contactsByP 
 WHERE nb > (SELECT MIN(nb)
               FROM contactsByP);
```
<!-- .element class="fragment float-right w-40 top right" data-db="CONTACTS"  data-title="requête avec WITH" -->

Avec la syntaxe WITH la même requête peut être réutiliser dynamiquement sans devoir créer une vue.

<!-- .element class="clear small fragment" -->

<!--
SELECT LEVEL niveau,
       code, 
       libelle fonction 
FROM fonctions
WHERE LEVEL = (SELECT LEVEL
                 FROM fonctions
                WHERE code = 'CTR'
               CONNECT BY PRIOR numero = num_fonction_mere
                 START WITH num_fonction_mere IS NULL)
CONNECT BY PRIOR numero = num_fonction_mere
START WITH num_fonction_mere IS NULL;

WITH arbre AS (
  SELECT LEVEL AS niveau, code, libelle AS fonction 
    FROM fonctions
  CONNECT BY PRIOR numero = num_fonction_mere
  START WITH num_fonction_mere IS NULL
)
SELECT *
FROM arbre
WHERE niveau = (SELECT niveau FROM arbre WHERE code = 'CTR');
-->




### Récursif

> Se dit d'un programme informatique organisé de manière telle qu'il puisse se rappeler lui-même, c'est-à-dire demander sa propre exécution au cours de son déroulement.<br/>- Larousse

&nbsp;

La récursivité  est une propriété que possède une règle ou un élément constituant de pouvoir se répéter de manière théoriquement indéfinie.
<!-- .element class="small" -->

note:
* Montrer une image contenant des images similaires
* Définir un concept en invoquant le même concept
* Écrire un algorithme qui s'invoque lui-même




M. C. Escher
<!-- .element class="bottom right credits" -->

<!-- .slide: data-background="/images/cte/escher.jpg" -->




## Fractale: flocon de Koch

![](/images/cte/Koch_Construction.jpg)

<!-- .element class="center" -->

`http://mathforum.org/mathimages/index.php/Image:Koch_Construction.jpg`

<!-- .element class="bottom right credits" -->

[Demo interactive](#/koch_snowflake)

<!-- .element class="smaller" -->

note:
Construction:
1. On divise le segment de droite en trois segments de longueurs égales.
2. On construit un triangle équilatéral ayant pour base le segment médian de la première étape.
3. On supprime le segment de droite qui était la base du triangle de la deuxième étape.

http://fr.wikipedia.org/wiki/Flocon_de_Koch




### Expression récursive: `WITH RECURISVE`

La syntaxe pour une expression de table récursive:

```
WITH <nom_requete> (liste_colonne)
AS (
SELECT ...
UNION ALL
SELECT ...
)
[SEARCH { DEPTH FIRST BY alias_c1 [,alias_c2]...
           [ ASC | DESC ] [ NULL FIRST | NULL LAST ]
         | BREADTH FIRST BY alias_c1 [,alias_c2]
           [ ASC | DESC ] [ NULL FIRST | NULL LAST ]
        }
      SET alias_col_ordre ]
[CYCLE alias_c1 [,alias_c2]...
   SET alias_col_cycle TO
          valeur_cycle DEFAULT valeur_non_cycle
SELECT ...
```
<!-- .element class="blockquote no-margin w-100" -->

dans Oracle le mot clée est `WITH` pour les deux types de CTE

(Soutou, C. (2013). SQL pour Oracle: Applications avec Java, PHP et XML. Optimisation des requêtes et schémas. Editions Eyrolles.)
<!-- .element class="credits bottom left" -->

note:
http://explainextended.com/2009/09/28/adjacency-list-vs-nested-sets-oracle/



### Sous-requête programmant la récursivité 

```
WITH <nom_requete> (liste_colonne)
AS (
SELECT ...
UNION ALL
SELECT ...
)
```
<!-- .element class="blockquote no-margin w-100" -->

Requête en deux parties:

1. *anchor member*,<br/>ne peut pas référencer la requête principale
2. *recursive member*,<br/>doit impérativement la référencer (récursivité)

L'opérateur **`UNION ALL`** doit être utilisé entre les requêtes.<br/>
Le nombre d'alias de colonnes doit être identique entre les deux.

<!-- .element class="warn small" -->

note:
La sous-requête programmant la récursivité doit être composée de deux requêtes: la première est dite *anchor member* et la seconde est appelée *recursive member*. La première ne peut pas référencer la requête principale tandis que la seconde doit impérativement la référencer, mais une seule fois. L'opérateur **UNION ALL** doit être utilisé entre la requête *anchor member* et la requête *recursive member*. (Soutou, C. (2013). SQL pour Oracle: Applications avec Java, PHP et XML. Optimisation des requêtes et schémas. Editions Eyrolles.)




### Hiérarchie requête récursive

![](/images/requetes_hierarchiques/org_plain.png)

![](/images/cte/table_enfants.png)
<!-- .element class="fragment top right" -->




### Première requête récursive

```sql
WITH parentDe(id, nom, parent_id) AS
(SELECT id, nom, parent_id
   FROM enfants
  UNION ALL
 SELECT enfants.id, enfants.nom, enfants.parent_id
   FROM enfants, parentDe
  WHERE parentDe.id = enfants.parent_id
)

SELECT nom
FROM parentDe;
```
<!-- .element class="run col2" data-db="SQLAVANCE" -->


*Résultat ambigu!*
<!-- .element: class="warn" --><br/>
Ajouter des colonnes calculées pour avoir le niveau<br/>
Limiter le noeud de départ

<!-- .element: class="fragment" -->




### Calcule du niveau

```sql
WITH parentDe(id, nom, parent_id, niveau) AS
(SELECT id, nom, parent_id, 1 AS niveau
   FROM enfants
  WHERE parent_id IS NULL
  UNION ALL
 SELECT enfants.id, LPAD(' ', niveau) || enfants.nom,
        enfants.parent_id, parentDe.niveau + 1 AS niveau
   FROM enfants, parentDe
  WHERE parentDe.id = enfants.parent_id
)

SELECT nom, niveau
FROM parentDe;
```
<!-- .element class="run col2" data-db="SQLAVANCE" -->

1. 1 = valeur initiale
2. n + 1 = opération de calcule à chaque récursion

note:
1. ajout de la condition WHERE parent_id IS NULL pour limiter le noeud de départ.
2. ajout de la colonne niveau: définition dans les deux sous-requêtes.
3. profiter de la nouvelle colonne niveau pour indenter les noms.




### Calcule du chemin

```sql
WITH parentDe(id, nom, parent_id, chemin)
AS (
SELECT id, nom, parent_id, nom AS chemin
  FROM enfants
 WHERE parent_id IS NULL
 UNION ALL
SELECT enfants.id, enfants.nom,
        enfants.parent_id,
   parentDe.chemin || '/' || enfants.nom
  FROM enfants, parentDe
 WHERE parentDe.id = enfants.parent_id
)
SELECT nom, chemin
FROM parentDe;
```
<!-- .element class="run col2" data-db="SQLAVANCE" -->

1. nom de départ  = valeur initiale
2. chemin jusqu'ici concatainé avec le nom actuel




### Ordre d'exploration
```
WITH <nom_requete> (liste_colonne)
AS ( ... )
[SEARCH { DEPTH FIRST BY alias_c1 [,alias_c2]...
           [ ASC | DESC ] [ NULL FIRST | NULL LAST ]
         | BREADTH FIRST BY alias_c1 [,alias_c2]
           [ ASC | DESC ] [ NULL FIRST | NULL LAST ]
        }
      SET alias_col_ordre ]
SELECT ...
```
<!-- .element class="blockquote no-margin w-100" -->

`SEARCH DEPTH FIRST` *Algorithme de parcours en profondeur*
explore « à fond » les chemins un par un : pour chaque sommet

`SEARCH BREADTH FIRST` *Algorithme de parcours en largeur*
liste d'abord les voisins du sommet pour ensuite les explorer un par un




### `SEARCH DEPTH FIRST`

![](/images/requetes_hierarchiques/org_dfs.png)




### `SEARCH DEPTH FIRST`
```sql
WITH parentDe(id, nom, parent_id, niveau, chemin)
AS (SELECT id, nom, parent_id, 1 AS niveau, nom AS chemin
      FROM enfants
     WHERE parent_id IS NULL -- début
     UNION ALL
    SELECT enfants.id, LPAD(' ', niveau) || enfants.nom,
            enfants.parent_id, niveau + 1 AS niveau,
            parentDe.chemin || '/' || enfants.nom AS chemin
      FROM enfants, parentDe 
     WHERE parentDe.id = enfants.parent_id -- recursivité
    )
SEARCH DEPTH FIRST BY nom
             SET tri_nom -- colonne virtuel de tri

SELECT nom, niveau, chemin
FROM parentDe
ORDER BY tri_nom ASC; -- utilsation de la colonne de tri
```
<!-- .element class="run" data-db="SQLAVANCE" -->




### `SEARCH BREADTH FIRST`

![](/images/requetes_hierarchiques/org_bfs.png)




### `SEARCH DEPTH FIRST`
```sql
WITH parentDe(id, nom, parent_id, niveau, chemin)
AS (SELECT id, nom, parent_id, 1 AS niveau, nom AS chemin
      FROM enfants
     WHERE parent_id IS NULL -- début
     UNION ALL
    SELECT enfants.id, LPAD(' ', niveau) || enfants.nom,
            enfants.parent_id, niveau + 1 AS niveau,
            parentDe.chemin || '/' || enfants.nom AS chemin
      FROM enfants, parentDe 
     WHERE parentDe.id = enfants.parent_id -- recursivité
    )
SEARCH BREADTH FIRST BY nom
             SET tri_nom -- colonne virtuel de tri

SELECT nom, niveau, chemin
FROM parentDe
ORDER BY tri_nom ASC; -- utilsation de la colonne de tri
```
<!-- .element class="run" data-db="SQLAVANCE" -->




### Cycles de colonnes

```
WITH <nom_requete> (liste_colonne)
AS (...)
...
[CYCLE alias_c1 [,alias_c2]...
   SET alias_col_cycle TO
          valeur_cycle DEFAULT valeur_non_cycle
SELECT ...
```
<!-- .element class="blockquote no-margin w-100" -->

La clause `CYCLE` permet de détecter les cycles de colonnes, une ligne compose un cycle lorsque l'une de ces lignes ancêtre a la même valeur pour une colonne donnée.

`alias_col_cycle` nom de la colonne virtuelle
`valeur_cycle` et `valeur_non_cycle` valeur de 1 caractère 

Attention il ne s'agit pas de cycle de l'arbre!
<!-- .element class="warn" -->




### Ajout de données cycles colonnes nom

```sql
INSERT INTO enfants_noms VALUES (131, 'Beatrice', 13);
INSERT INTO enfants_noms VALUES (1311, 'Adam', 131);
INSERT INTO enfants_noms VALUES (1312, 'Emilie', 131);

```

```sql
WITH parentDe(id, nom, parent_id, niveau, chemin) AS
(SELECT id, nom, parent_id, 1 AS niveau, nom AS chemin
   FROM enfants_noms
  WHERE parent_id IS NULL
  UNION ALL
 SELECT enfants.id, LPAD(' ', niveau) || enfants.nom, enfants.parent_id,
        niveau + 1, parentDe.chemin || '/' || enfants.nom
   FROM enfants_noms enfants, parentDe
  WHERE parentDe.id = enfants.parent_id
)
SEARCH DEPTH FIRST BY nom SET tri_nom
SELECT nom, niveau, chemin
FROM parentDe;
```
<!-- .element class="run" data-db="SQLAVANCE" -->




#### Personnes qui ont le même nom qu'un ancêtre

```sql
WITH parentDe(id, nom, parent_id, niveau, chemin) AS
(SELECT id, nom, parent_id, 1 AS niveau, nom AS chemin
   FROM enfants_noms
  WHERE parent_id IS NULL
  UNION ALL
 SELECT enfants.id, enfants.nom, enfants.parent_id, 
        niveau + 1, parentDe.chemin || '/' || enfants.nom
   FROM enfants_noms enfants, parentDe
  WHERE parentDe.id = enfants.parent_id
)
SEARCH DEPTH FIRST BY nom SET tri_nom
CYCLE nom -- détecter des cycle sur le nom
      SET meme_nom TO 'O' -- valeur si cycle
      DEFAULT 'N' -- valeur sinon
SELECT nom, meme_nom, chemin
FROM parentDe;
```
<!-- .element class="run" data-db="SQLAVANCE" -->




# Parcours de graphe
<!-- .element style="color:#fff;text-shadow: 4px 4px 2px rgba(0, 0, 0, 0.54);" -->

<!-- .slide: data-background="/images/cte/internet_map.jpg" -->




### Réseau autoroutier de Suisse

![](/images/cte/endausbau_fr.jpg)

http://www.astra.admin.ch/themen/nationalstrassen/00254/index.html?lang=fr

<!-- .element class="bottom right credits" -->




### Réseau des autoroutes (extrait)

![](/images/cte/autoroutes.svg)

<!-- .element class="center" -->

![](/images/cte/table_autoroutes.png)

<!-- .element class="fragment top right" -->

```sql
CREATE TABLE Autoroutes(
 Ville_De VARCHAR2(20) NOT NULL,
 Ville_Vers VARCHAR2(20) NOT NULL,
 Km NUMERIC NOT NULL,
 Temps NUMERIC NOT NULL
);
```
<!-- .element class="fragment bottom left w-40" -->




### Destination possible depuis Lausanne

```sql
WITH Trajets (ville_vers)
AS (SELECT ville_vers
    FROM Autoroutes
    WHERE ville_de = 'Lausanne'
    UNION ALL
    SELECT A.ville_vers
    FROM Trajets T, Autoroutes A
    WHERE A.ville_de = T.ville_vers
)
SELECT *
FROM trajets;
```
<!-- .element class="run" data-db="SQLAVANCE" -->




## etape

```sql
WITH Trajets (ville_vers, etape)
AS (SELECT ville_vers, 0 AS etape
    FROM Autoroutes
    WHERE ville_de = 'Lausanne'
    UNION ALL
    SELECT A.ville_vers, T.etape + 1 AS etape
    FROM Trajets T, Autoroutes A
    WHERE A.ville_de = T.ville_vers
)
SELECT *
FROM trajets
WHERE ville_vers = 'Bienne';
```
<!-- .element class="run" data-db="SQLAVANCE" -->




## Version generic

```sql
WITH Trajets (ville_de, ville_vers, etape)
AS (SELECT ville_de, ville_vers, 0
    FROM Autoroutes
    UNION ALL
    SELECT T.ville_de,  A.ville_vers, T.etape + 1
    FROM Trajets T, Autoroutes A
    WHERE A.ville_de = T.ville_vers
)
SELECT *
FROM trajets;
```
<!-- .element class="run" data-db="SQLAVANCE" -->




##calcule

```sql
WITH Trajets (ville_de, ville_vers, etape, distance, temps)
AS (SELECT ville_de, ville_vers, 0, km, temps
    FROM Autoroutes
    UNION ALL
    SELECT T.ville_de,  A.ville_vers, T.etape + 1, T.distance + A.km, T.temps + A.temps
    FROM Trajets T, Autoroutes A
    WHERE A.ville_de = T.ville_vers
)
SELECT *
FROM trajets
WHERE ville_de = 'Lausanne' AND ville_vers = 'Bienne';
```
<!-- .element class="run" data-db="SQLAVANCE" -->




##chemin

```sql
WITH Trajets (ville_de, ville_vers, etape, distance, temps, trajet)
AS (SELECT ville_de, ville_vers, 0, km, temps, ville_de || '/' || ville_vers
    FROM Autoroutes
    UNION ALL
    SELECT T.ville_de,  A.ville_vers, T.etape + 1, T.distance + A.km, T.temps + A.temps,
      T.trajet ||'/'|| A.ville_vers
    FROM Trajets T, Autoroutes A
    WHERE A.ville_de = T.ville_vers
)
SELECT *
FROM trajets
WHERE ville_de = 'Lausanne' AND ville_vers = 'Bienne';
```
<!-- .element class="run" data-db="SQLAVANCE" -->


Chemin inverse? -> non?




### graphe orienté 

ajouter les inverse
-> cycle
INSERT INTO Autoroutes_cycles SELECT ville_de, ville_vers, etape, distance, temps FROM Autoroutes;
INSERT INTO Autoroutes_cycles SELECT ville_vers, ville_de, etape, distance, temps FROM Autoroutes;

```sql
WITH Trajets (ville_de, ville_vers, etape, distance, temps)
AS (SELECT ville_de, ville_vers, 0, km, temps
    FROM Autoroutes_cycles
    UNION ALL
    SELECT T.ville_de,  A.ville_vers, T.etape + 1, T.distance + A.km, T.temps + A.temps
    FROM Trajets T, Autoroutes_cycles A
    WHERE A.ville_de = T.ville_vers
)
SELECT *
FROM trajets
WHERE ville_de = 'Bienne' AND ville_vers = 'Lausanne';
```
<!-- .element class="run" data-db="SQLAVANCE" -->





## Cycle de parcours

```sql
WITH Trajets (ville_de, ville_vers, etape, distance, temps, trajet)
AS (SELECT ville_de, ville_vers, 0, km, temps, ville_de || '->' || ville_vers
    FROM Autoroutes_cycles
    UNION ALL
    SELECT T.ville_de,  A.ville_vers, T.etape + 1, T.distance + A.km, T.temps + A.temps,
      T.trajet ||'->'|| A.ville_vers
    FROM Trajets T, Autoroutes_cycles A
    WHERE A.ville_de = T.ville_vers
    -- condition de limit de cycles
    AND T.etape < 10
    -- ne pas faire d'aller-retour
    AND T.trajet NOT LIKE '%' || A.ville_vers || '%'
)
SELECT *
FROM trajets
WHERE ville_de = 'Bienne' AND ville_vers = 'Lausanne'
ORDER BY temps, distance;
```
<!-- .element class="run" data-db="SQLAVANCE" -->

[Demo](#/demo-autoroutes)
<!-- .element class="bottom left" -->


# bonus

```sql
SELECT trajet
FROM (SELECT DISTINCT CONNECT_BY_ROOT(ville_de) ville_de, ville_de AS ville_vers, LTRIM(SYS_CONNECT_BY_PATH(ville_de, '->'), '->') AS trajet
FROM Autoroutes_cycles
WHERE CONNECT_BY_ISLEAF = 1
CONNECT BY NOCYCLE PRIOR ville_de =  ville_vers
) t
WHERE ville_de = 'Lausanne'
AND ville_vers = 'Bienne'
```
<!-- .element class="run" data-db="SQLAVANCE" -->



```sql
SELECT
CASE WHEN a.ville_de = 'Neuchâtel' AND a.ville_vers = 'Bern' THEN '{rank=same ' ELSE '' END ||
'"'|| ville_de || '" -> "' || ville_vers || '" [label="' || km ||' km\n'|| temps ||' min", id="' || ville_de || ville_vers ||'"];' ||
CASE WHEN a.ville_de = 'Neuchâtel' AND a.ville_vers = 'Bern' THEN '}' ELSE '' END graphviz_code
FROM autoroutes a;
```
<!-- .element class="run" data-db="SQLAVANCE" -->



```sql
WITH trajets_cycles(ville_de, ville_vers) AS 
(SELECT ville_de, ville_vers
FROM autoroutes_cycles
WHERE 'Bienne->Neuchâtel->Yverdon-les-Bains->Bern->Lausanne' LIKE '%' || ville_de || '->' || ville_vers || '%'
),
trajets(ville_de, ville_vers) AS
(SELECT ville_de, ville_vers
FROM autoroutes
WHERE (ville_de, ville_vers) IN (SELECT * FROM trajets_cycles)
OR  (ville_vers, ville_de) IN (SELECT * FROM trajets_cycles)
)
SELECT 
CASE WHEN a.ville_de = 'Neuchâtel' AND a.ville_vers = 'Bern' THEN '{rank=same' ELSE '' END ||
'"'|| a.ville_de || '" -> "' || a.ville_vers || '" [label="' || a.km ||' km\n'|| a.temps ||' min"'||
CASE WHEN b.ville_de IS NOT NULL THEN ',color=red, style=bold' ELSE '' END ||'];' ||
CASE WHEN a.ville_de = 'Neuchâtel' AND a.ville_vers = 'Bern' THEN '}' ELSE '' END
AS edges
FROM autoroutes a LEFT JOIN trajets b ON a.ville_vers = b.ville_vers AND a.ville_de = b.ville_de;
```
<!-- .element class="run" data-db="SQLAVANCE" -->



```
digraph autoroutes{
splines=polyline;
rankdir = BT;

node[shape=box, penwidth=0, width=2.3, fontcolor=white, height=0.6, fontname="Arial", style=filled, fillcolor=forestgreen];
"Bern" [id="Be"];
"Bienne" [id="Bi"];
"Neuchâtel" [id="Ne"];
"Yverdon-les-Bains" [id="Yv"];
"Lausanne" [id="La"];
edge[fontname="Arial", dir=none];
"Lausanne" -> "Yverdon-les-Bains" [label="32 km\n20 min", id="LaYv"];
"Lausanne" -> "Bern" [label="100 km\n58 min", id="LaBe"];
"Yverdon-les-Bains" -> "Neuchâtel" [label="39 km\n24 min", id="YvNe"];
"Yverdon-les-Bains" -> "Bern" [label="70 km\n43 min", id="YvBe"];
"Neuchâtel" -> "Bienne" [label="32 km\n27 min", id="NeBi"];
{rank=same "Neuchâtel" -> "Bern" [label="47 km\n40 min", id="NeBe"];}
"Bern" -> "Bienne" [label="42 km\n32 min", id="BeBi"];
}
```

http://stamm-wilbrandt.de/GraphvizFiddle/