![](/images/requetes_hierarchiques/cours_map.png)




### SQL:<br/>Requêtes hiérarchiques
<!-- .element: class="warn" style="position:absolute; left:0; bottom: 20px;" -->

![](/images/requetes_hierarchiques/intro_title.jpg)




## Arbre hiérarchique

Les arbres hiérarchiques représentent des structures très courantes en informatique

Une arborescence peut représenter:

- Un organigramme
- Une structure de fichiers
- Une nomenclature
- Un arbre généalogique
- Composition de pièces
- ...




## Limites du modèle relationnel

Le modèle relationnel est simple et efficace, mais il n'est pas capable de gérer certaines structures de bases, tel que:

**Les structures hiérarchiques**

<!-- .element: class="center"-->

La représentation d'un « arbre » est simple
mais son parcours posera des difficultés.

<!-- .element: class="comment"-->




## Associations réflexives

![](/images/requetes_hierarchiques/associations_reflexives1.png)
<!-- .element: class="fragment w-66"-->

<!-- .element: class="center w-50"-->

![](/images/requetes_hierarchiques/associations_reflexives2.png)
<!-- .element: class="fragment w-75"-->

<!-- .element: class="center w-50"-->

<!-- .slide: class="layout-two" -->




### Représentation d’une structure hiérarchique
![](/images/requetes_hierarchiques/org_plain.png)




### Représentation d’une structure hiérarchique
![](/images/requetes_hierarchiques/org_bfs.png)




### Représentation SQL

```sql
CREATE TABLE enfants (
  id NUMERIC PRIMARY KEY,
  nom VARCHAR2(12) NOT NULL,
  parent_id NUMERIC,
  FOREIGN KEY (parent_id) REFERENCES enfants
);
```

```sql
SELECT * FROM enfants;
```
<!-- .element: class="run hide" data-db="SQLAVANCE" -->




### Recherche des relations parent/enfant

Une auto-jointure externe permet de mettre en relation un niveau parent-enfant

```sql
SELECT parent.nom AS parent, enfant.nom AS enfant
  FROM enfants enfant
  LEFT OUTER JOIN enfants parent
    ON enfant.parent_id = parent.id;
```
<!-- .element: class="col2 run start-hidden" data-db="SQLAVANCE" -->




### Recherche des relations enfant/parent

L'auto-jointure permet également de rechercher les enfants

*Les feuilles sont les nœuds qui n’ont pas d’enfants*

```sql
SELECT parent.nom AS parent, enfant.nom AS enfant
  FROM enfants enfant
 RIGHT OUTER JOIN enfants parent
    ON enfant.parent_id = parent.id;
```
<!-- .element: class="col2 run start-hidden" data-db="SQLAVANCE" -->




### Recherche des relations enfant/parent/grand parent

L'auto-jointure ne permet de mettre en relation q'un niveau à la fois.

Problème de **scalabilité**
<!-- .element class="warn" -->

```sql
SELECT grand_parent.nom AS grand_parent,
       parent.nom AS parent,
       enfant.nom AS enfant
  FROM enfants enfant
  JOIN enfants parent
    ON enfant.parent_id = parent.id
  JOIN enfants grand_parent
    ON grand_parent.id = parent.parent_id;
```
<!-- .element: class="col2 run start-hidden" data-db="SQLAVANCE" -->




### Clauses de spécification du parcours de la structure hiérarchique (Solution Oracle)

**CONNECT BY** <br/>
*Relation « père-fils » de l’arbre*

**PRIOR** <br/>
*Sens du parcours de l’arbre (ascendant/descendant)*

**START WITH** <br/>
*Nœud de départ de la structure*

![](/images/requetes_hierarchiques/railroad_connectby.gif)




### Exemple CONNECT BY

```sql
SELECT nom
  FROM enfants
CONNECT BY PRIOR id = parent_id;
```
<!-- .element: class="col2 run" data-fragment-index="0" data-db="SQLAVANCE" -->


*Parcours ambigu!*
<!-- .element: class="warn" --><br/>
Sans définition du nœud de début du parcours, l’arbre est parcouru pour chaque nœud.

<!-- .element: class="fragment"  -->

note:
    fix code fragment index




### Afficher le niveau du parcours

```sql
SELECT level, LPAD(' ', level) || nom AS nom
  FROM enfants
CONNECT BY PRIOR id = parent_id;
```
<!-- .element: class="col2 run start-hidden" data-db="SQLAVANCE" -->




### Parcours de l’arbre, depuis l’ancêtre

Le parcours de l’arbre est défini par

Le lien parent-enfant<br/>
**CONNECT BY**

Le sens de parcours<br/>
**PRIOR**

Le début du parcours<br/>
**START WITH**

```sql
SELECT level, LPAD(' ', level) || nom AS nom
  FROM enfants
CONNECT BY PRIOR id = parent_id
START WITH parent_id IS NULL;
```
<!-- .element: class="top right run start-hidden" data-db="SQLAVANCE" -->




### Visualisation du parcours d’un arbre

![](/images/requetes_hierarchiques/arbres_parcour.png)




### Visualisation du parcours de l'exemple

![](/images/requetes_hierarchiques/org_dfs.png)




### Parcours de la structure

1. Sélection de la "racine" (**START WITH**)
2. Sélection des tuples enfants satisfaisants la clause **CONNECT BY** pour un tuple racine
3. Générations successives de tuples enfants.
  - Sélection des enfants retournés au point 2, puis sélectionne les enfants de ceux-ci et ainsi de suite
4. Evaluation de la clause **WHERE**.
  - Le système évalue cette condition pour chaque tuple de manière individuelle plutôt que d’éliminer tous les enfants d’un tuple qui ne la satisfait pas




### Définition du début du parcours

Le début du parcours n’est pas forcément l’ancêtre.

**Attention aux parcours « multiples »**

```sql
SELECT level, LPAD(' ', level) || nom AS nom
  FROM enfants
CONNECT BY PRIOR id = parent_id
START WITH nom='Beatrice';
```
<!-- .element: class="col2 run start-hidden" data-db="SQLAVANCE" -->




### Contrôle du parcours

On connaît le niveau dynamique de la profondeur du parcours avec la pseudo colonne **LEVEL**.

- **LEVEL** est relatif au nœud de départ du parcours.
- Il peut être retourné et/ou utilisé dans la clause WHERE


```sql
SELECT level, LPAD(' ', level) || nom AS nom
  FROM enfants
 WHERE level <=2
CONNECT BY id = PRIOR parent_id
```
<!-- .element: class="col2  run start-hidden" data-db="SQLAVANCE" -->




### Les niveaux de notre exemple

![](/images/requetes_hierarchiques/org_level_top_bottom.png)




### Parcours inverse

La clause **PRIOR** permet de définir le sens du parcours.


```sql
SELECT level, LPAD(' ', level) || nom AS nom
  FROM enfants
CONNECT BY id = PRIOR parent_id
START WITH nom LIKE 'D%';
```
<!-- .element: class="col2 run start-hidden" data-db="SQLAVANCE" -->




### Les niveaux en parcours inverse

![](/images/requetes_hierarchiques/org_level_bottom_top.png)




### Elagage avec WHERE

Avec une condition **WHERE** on peut filtrer/éliminier des nœuds de l'arbre.

```sql
SELECT level, LPAD(' ', level) || nom AS nom
  FROM enfants
 WHERE NOT nom = 'Carl'
CONNECT BY PRIOR id = parent_id
START WITH parent_id IS NULL;
```
<!-- .element: class="col2 run start-hidden" data-db="SQLAVANCE" -->




### Elagage avec WHERE

![](/images/requetes_hierarchiques/org_trim_where.png)




### Elagage avec CONNECT BY

Avec une condition dans **CONNECT BY** on peut filtrer/éliminier des nœuds de l'arbre.

```sql
SELECT level, LPAD(' ', level) || nom AS nom
  FROM enfants
CONNECT BY PRIOR id = parent_id
        AND NOT nom = 'Bertrand'
START WITH parent_id IS NULL;
```
<!-- .element: class="col2 run start-hidden" data-db="SQLAVANCE" -->




### Elagage avec CONNECT BY

![](/images/requetes_hierarchiques/org_trim_connect.png)




### Elagage avec CONNECT BY et WHERE

```sql
SELECT level, LPAD(' ', level) || nom AS nom
  FROM enfants
 WHERE NOT nom = 'Carl'
CONNECT BY PRIOR id = parent_id
        AND NOT nom = 'Bertrand'
START WITH parent_id IS NULL;
```
<!-- .element: class="col2 run start-hidden" data-db="SQLAVANCE" -->




### Plusieurs tables

```sql
CREATE TABLE enfants_metiers(
  enfant_id NUMERIC,
  metier VARCHAR2(20)
);
INSERT INTO enfants_metiers VALUES(1, 'Policier');
INSERT INTO enfants_metiers VALUES(1, 'Pompier');
```

```sql
SELECT level, LPAD(' ', level) || nom AS nom, 
       metier
  FROM enfants LEFT JOIN enfants_metiers em
    ON em.enfant_id = enfants.id
CONNECT BY PRIOR id = parent_id
START WITH parent_id IS NULL;
```
<!-- .element: class="col2 run start-hidden" data-db="SQLAVANCE" -->

Attention cependant à ne pas éliminer des nœuds nécessaires pour créer l'arbre!
<!-- .element: class="warn bottom left w-66" -->




### Affichage du chemin

**SYS_CONNECT_BY_PATH**

- permet de retourner le chemin des nœuds parcourus
- Le séparateur est paramétrable

<!-- .element: class="small" -->

```sql
SELECT level, LPAD(' ', level) || nom AS nom,
       SYS_CONNECT_BY_PATH(nom, '/') AS chemin
  FROM enfants
CONNECT BY PRIOR id = parent_id
START WITH parent_id IS NULL;
```
<!-- .element: class="run start-hidden" data-db="SQLAVANCE" -->

note:
  Visualiser une partie du chemin.
  http://ashitani.jp/gv/#
  LTRIM(,'->')
  




### Affichage du chemin

```sql
SELECT level, LPAD(' ', level) || nom AS nom,
       SYS_CONNECT_BY_PATH(nom, '/') AS chemin
  FROM enfants
 WHERE LEVEL > 1
CONNECT BY PRIOR id = parent_id;
```
<!-- .element: class="run start-hidden" data-db="SQLAVANCE" -->




### Distance entre les noeuds

**CONNECT_BY_ROOT**
 
Permet d’afficher des champs du premier ancetre du noeud


```sql
SELECT level, LPAD(' ', level) || nom AS nom,
       CONNECT_BY_ROOT nom AS ancetre,
       CONNECT_BY_ROOT id AS ancetre_id,
       SYS_CONNECT_BY_PATH(nom, '/') AS chemin
  FROM enfants
 WHERE LEVEL > 1
CONNECT BY PRIOR id = parent_id;
```
<!-- .element: class="run start-hidden" data-db="SQLAVANCE" -->




### Détection des feuilles

La clause **CONNECT_BY_ISLEAF** permet de détecter les feuilles.

- Une feuille est un nœud qui n’a pas d’enfant(s)
- La clause peut être retournée et/ou utilisée dans la sélection


```sql
SELECT level, LPAD(' ', level) || nom AS nom, CONNECT_BY_ISLEAF AS feuille
FROM enfants
CONNECT BY PRIOR id = parent_id
START WITH parent_id IS NULL;
```
<!-- .element: class="run start-hidden" data-db="SQLAVANCE" -->



![](/images/requetes_hierarchiques/org_plain.png)

```sql
SELECT level, LPAD(' ', level) || nom AS nom, CONNECT_BY_ISLEAF AS feuille
FROM enfants
CONNECT BY PRIOR id = parent_id
START WITH parent_id IS NULL;
```
<!-- .element: class="run hide top left no-margin" data-db="SQLAVANCE" -->




### Cycle dans l’arborescence

Si un cycle est détecté dans l’arbre, un message d’erreur est retourné

```sql
UPDATE enfants SET parent_id = 111 WHERE id=0;
```

```sql
SELECT level, LPAD(' ', level) || nom AS nom
FROM enfants_cycle
CONNECT BY PRIOR id = parent_id
START WITH id=0;
```
<!-- .element: class="run start-hidden" data-db="SQLAVANCE" -->

note:
  ORA-01436: boucle CONNECT BY dans les données utilisateur
  01436. 00000 -  "CONNECT BY loop in user data"
  Utiliser: CONNECT BY NOCYCLE pour résoudre le problème





### Pseudo-colonnes de contrôle 

Un cycle peut être détecté par la clause **CONNECT_BY_ISCYCLE**

1 si un cycle est detecté sur le nœud, 0 sinon
<!-- .element: class="small" -->

Le parcours doit être défini sans cycle (NOCYCLE)
<!-- .element: class="warn" -->

```sql
SELECT level, LPAD(' ', level) || nom AS nom,
       CONNECT_BY_ISCYCLE AS cycle
  FROM enfants_cycle
CONNECT BY NOCYCLE PRIOR id = parent_id
START WITH id=0;
```
<!-- .element: class="run start-hidden top right no-margin" data-db="SQLAVANCE" -->




### Ordre de parcours des noeuds

Une clause **ORDER BY** classique « brise » le parcours de l’arbre

La clause **SIBLINGS** permet de trier les nœuds de mêmes niveaux, selon un ordre naturel pour l’humain

```sql
SELECT level, LPAD(' ', level) || nom AS nom
FROM enfants
CONNECT BY PRIOR id = parent_id
START WITH parent_id IS NULL
ORDER BY enfants.nom ASC;
```
<!-- .element: class="run col2 start-hidden" data-db="SQLAVANCE" -->




```sql
SELECT level, LPAD(' ', level) || nom AS nom
FROM enfants
CONNECT BY PRIOR id = parent_id
START WITH parent_id IS NULL
```
<!-- .element: class="col2 run start-hidden" data-db="SQLAVANCE" -->

```sql
SELECT level, LPAD(' ', level) || nom AS nom
FROM enfants
CONNECT BY PRIOR id = parent_id
START WITH parent_id IS NULL
ORDER SIBLINGS BY enfants.nom DESC;
```
<!-- .element: class="col2 run start-hidden" data-db="SQLAVANCE" -->




### En bref

| SQL | Description |
|--------|----------|
| **ONNECT BY** | Relation père fils. 
| **PRIOR** | Sens du parcours de l’arbre. 
| **START WITH** | La racine de la hiérarchie à partir de laquelle commence le parcours. 
| **NOCYCLE** | Pour afficher les données même en cas de boucles. 
| **LEVEL** | Une pseudo-colonne qui montre le niveau du nœud en fonction du départ. 
| **CONNECT_BY_ISLEAF** | Une pseudo-colonne qui affiche 1 si un nœud est une feuille. 
| **CONNECT_BY_ISCYCLE** | Sert à détecter la boucle. Doit être utilisée avec la clause NOCYCLE. 
| **SYS_CONNECT_BY_PATH** | Une fonction qui permet de restituer le nœud en partant de la racine. 
| **CONNECT_BY_ROOT** | Un opérateur qui extrait les données depuis la racine. 
| **SIBLINGS** | Une clause de tri des structures hiérarchiques. 
<!-- .slide: class="summary" -->
