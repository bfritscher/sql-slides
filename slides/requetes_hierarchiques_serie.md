## Série 5
# Requêtes hiérarchiques




### 1. Création d'un arbre

Ajouter une colonne **NUM_FONCTION_MERE** dans votre table **FONCTIONS** pour permettre de les hiérarchiser.

Assurez vous que l’arbre soit cohérent (contraintes).
<!-- .element class="warn" -->

```sql
ALTER TABLE fonctions ADD (
  num_fonction_mere Number(38),
  CONSTRAINT fk_num_fonction_mere
    FOREIGN KEY (num_fonction_mere) REFERENCES fonctions
);
```
<!-- .element class="fragment" -->




### 2. Peuplement de l'arborescence

Peupler les clés étrangères pour obtenir la hiérarchie de fonctions suivante:

![](/images/requetes_hierarchiques/org_fonctions.png)

```sql
UPDATE fonctions
SET num_fonction_mere = (SELECT numero FROM fonctions WHERE code ='DIR')
WHERE code = 'RFIN' OR code = 'RINF' OR code = 'SDIR' ;
```
<!-- .element class="fragment" -->



### 2b. Peuplement de l'arborescence

```sql
UPDATE fonctions 
   SET num_fonction_mere = (SELECT numero
                              FROM fonctions
                             WHERE code ='RFIN')
 WHERE code = 'CPT'
    OR code = 'CTR' ;
```

```sql
UPDATE fonctions 
   SET num_fonction_mere = (SELECT numero
                              FROM fonctions
                             WHERE code ='RINF')
 WHERE code = 'DBA'
    OR code = 'DEV' 
    OR code = 'ARCH' ;
```
     
```sql
UPDATE fonctions 
   SET num_fonction_mere = (SELECT numero
                              FROM fonctions
                             WHERE code ='SDIR')
 WHERE code = 'SEC'
    OR code = 'ASS' 
```




### 3. Vérifier les données

en affichant les couples code de fonction / code de fonction responsable.

*Vous avez la possibilité de nettoyer et charger une base correcte avec les scripts db_clean et db_create qui sont mise à disposition.*
<!-- .element class="warn small" -->

```sql
SELECT fonct.code code_fonction,
       resp.code code_responsable  
  FROM fonctions fonct 
  LEFT OUTER JOIN fonctions resp 
    ON resp.numero = fonct.num_fonction_mere
 ORDER BY resp.code;
```
<!-- .element class="fragment col2 run output-in-statement" data-db="SQLAVANCE" -->




### 4. Visualisation de l'arbre
Visualiser toutes les libelles des fonctions en partant de l’ancêtre, en mentionnant leur niveau dans la hiérarchie. L’indentation de l’affichage du libellé en fonction du niveau est souhaitée.

```sql
SELECT LEVEL niveau,
  LPAD(' ', LEVEL) || libelle fonction
  FROM fonctions
CONNECT BY PRIOR numero = num_fonction_mere
START WITH num_fonction_mere IS NULL;
```
<!-- .element class="fragment col2 run" data-db="SQLAVANCE" -->




### 5. Visualisation des chemins
Visualiser tous les libelles des fonctions en partant de l’ancêtre, Afficher le chemin des codes séparée par des '->'.
*Bonus: ne pas afficher le '->' au début.*
<!-- .element class="smaller" -->

```sql
SELECT libelle fonction, LTRIM(SYS_CONNECT_BY_PATH(code,'->'), '->') chemin
FROM fonctions
CONNECT BY PRIOR numero = num_fonction_mere
START WITH num_fonction_mere IS NULL;
```
<!-- .element class="fragment run" data-db="SQLAVANCE" -->




### 6. Visualisation d’une portion de l’arbre
Visualisez le niveau et le libelle des fonctions qui dépendent de la fonction du responsable informatique.

```sql
SELECT LEVEL niveau,
       libelle fonction
FROM fonctions
WHERE level > 1
CONNECT BY PRIOR numero = num_fonction_mere
START WITH code ='RINF' ;
```
<!-- .element class="fragment col2 run start-hidden" data-fragment-index="1"  data-output-fragment-index="0"  data-db="SQLAVANCE" -->




### 7. Visualisation d’une branche de l’arbre
Visualisez le niveau et le libelle des fonctions dont ils dépendent (avec indentation), mais sans la fonction *SDIR* et toutes ses subordonnées.
```sql
SELECT LEVEL niveau,
  LPAD(' ', LEVEL) || libelle fonction
  FROM fonctions
CONNECT BY PRIOR numero = num_fonction_mere
AND code <> 'SDIR'
START WITH num_fonction_mere is null;
```
<!-- .element class="fragment col2 run" data-db="SQLAVANCE" -->



![](/images/requetes_hierarchiques/org_fonctions.png)

```sql
SELECT LEVEL niveau,
  LPAD(' ', LEVEL) || libelle fonction
  FROM fonctions
CONNECT BY PRIOR numero = num_fonction_mere
             AND code <> 'SDIR'
START WITH num_fonction_mere is null;
```
<!-- .element class="run hide" data-db="SQLAVANCE" -->




### 8. Recherche d’ancêtre, avec contrôle de niveau
Quel est la fonction directement supérieure au Comptable?

```sql
SELECT code, libelle fonction
  FROM fonctions
 WHERE LEVEL = 2
CONNECT BY numero = PRIOR num_fonction_mere
START WITH code = 'CPT';
```
<!-- .element class="fragment col2 run start-hidden" data-fragment-index="1"  data-output-fragment-index="0" data-db="SQLAVANCE" -->




### 9. Recherche des feuilles
Quelles sont les fonctions du bas de la hiérarchie ?<br/>
*(Celles qui n’ont pas de fonctions enfants)*
<!-- .element class="small" -->

```sql
SELECT code, libelle fonction
  FROM fonctions
 WHERE CONNECT_BY_ISLEAF = 1
CONNECT BY PRIOR numero = num_fonction_mere
START WITH num_fonction_mere is null;
```
<!-- .element class="fragment col2 run" data-db="SQLAVANCE" -->



![](/images/requetes_hierarchiques/org_fonctions.png)

```sql
SELECT code, libelle fonction
  FROM fonctions
 WHERE CONNECT_BY_ISLEAF = 1
CONNECT BY PRIOR numero = num_fonction_mere
START WITH num_fonction_mere is null;
```
<!-- .element class="hide run" data-db="SQLAVANCE" -->




### 10. Recherche par niveau
Quelles sont les fonctions de même niveau que la fonction Contrôleur?

```sql
SELECT LEVEL niveau, code, libelle fonction 
  FROM fonctions
 WHERE LEVEL = ( SELECT LEVEL
         FROM fonctions
        WHERE code = 'CTR'
      CONNECT BY PRIOR numero = num_fonction_mere
        START WITH num_fonction_mere IS NULL
               )
CONNECT BY PRIOR numero = num_fonction_mere
START WITH num_fonction_mere IS NULL;
```
<!-- .element class="fragment col2 run no-margin" data-fragment-index="1"  data-output-fragment-index="0" data-db="SQLAVANCE" -->
