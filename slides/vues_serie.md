## Série 3
# Vues




![](/images/vues/schema.png)

*Besoin: des tables crées pendant la **série 1 et 2**, ainsi que de l'exécution du script **create_triggers.sql***
<!-- .element class="smaller" -->




### 1-6. Méthodes pour la série 

1. Trouver le code **SELECT** qui répond à la question.
2. Crée la vue
3. Vérifier si la vue autorise les opérations LMD


- SELECT, INSERT, UPDATE
- De quel type est la vue?




### 1. Vue
Créer une vue **v_employes** qui liste le numéro, le code, le nom, le prénom et la date de naissance des employés dont le nom commence par la lettre « D ».

*Tester l’insertion, la mise a jours et la suppression d’employés, a travers cette vue, y.c. des employés dont le nom ne commence pas par la lettre « D »*
<!-- .element class="small" -->

```sql
CREATE OR REPLACE VIEW v_employes1 AS
  SELECT numero, code, nom, prenom, date_naissance
    FROM employes
   WHERE nom Like 'D%';
```
<!-- .element class="fragment" -->

```sql
SELECT * FROM v_employes1;
```
<!-- .element class="run hide start-hidden" data-db="SQLAVANCE" -->



### 1. Vue - LMD

```sql
INSERT INTO v_employes1 (numero, code, nom, prenom, date_naissance) VALUES (
    seq_employes.Nextval, 'HDU', 'Duvoisin', 'Henri',
    to_date('15.05.1963','dd.mm.yyyy')
);
```

```sql
INSERT INTO v_employes1 (numero, code, nom, prenom, date_naissance) VALUES (
    seq_employes.Nextval,'EGR', 'Grandet', 'Eugénie',
    to_date('25.12.1959','dd.mm.yyyy')
);
```

INSERT, UPDATE, DELETE --> OK




### 2. Vue WITH CHECK OPTION
Ajouter la clause WITH CHECK OPTION à la vue v_employes.
*Tester les opérations d’ajout, de mise à jour et de suppressions (y.c. des employés dont le nom ne commence pas par la lettre « D »).*
<!-- .element class="small" -->

Quelles sont les comportements avec CHECK OPTION ?


```sql
CREATE OR REPLACE VIEW v_employes2 AS
  SELECT numero, code, nom, prenom, date_naissance
    FROM employes
   WHERE nom Like 'D%'
    WITH CHECK OPTION;
```
<!-- .element class="fragment" -->

```sql
SELECT * FROM v_employes2;
```
<!-- .element class="run hide start-hidden" data-db="SQLAVANCE" -->



### 2. Vue WITH CHECK OPTION - LMD

Ajout d'un employé dont le nom commence par "D"

```sql
INSERT INTO v_employes2 (code, nom, prenom, date_naissance) VALUES (
      'HDU', 'Duvoisin', 'Henri', to_date('15.05.1963','dd.mm.yyyy'));
```
<!-- .element class="fragment" -->

Résultat: OK
<!-- .element class="fragment" -->

Update d'un employé dont le nom commence par "D" et lui donner un nom qui commence également par "D".
<!-- .element class="fragment" -->
```sql
UPDATE v_employes2
   SET nom = 'Duhamel'
 WHERE code = 'MDI';
```
<!-- .element class="fragment" -->

Résultat: OK
<!-- .element class="fragment" -->



Ajout d'un employé dont le nom ne commence pas par "D"
```sql
INSERT INTO v_employes2 (code, nom, prenom, date_naissance) VALUES (
       'EGR', 'Grandet', 'Eugénie',to_date('25.12.1959','dd.mm.yyyy'));
```
<!-- .element class="fragment" -->

Erreur SQL : ORA-01402: vue WITH CHECK OPTION - violation de clause WHERE 01402. 00000 -  "view WITH CHECK OPTION where-clause violation"
<!-- .element class="fragment error small" -->

Update d'un employé dont le nom commence par "D" et lui donner un nom qui ne commence pas par "D".
<!-- .element class="fragment" -->
```sql
UPDATE v_employes2
   SET nom = 'Charmillot'
 WHERE code = 'MDI';
```
<!-- .element class="fragment" -->

Erreur SQL : ORA-01402: vue WITH CHECK OPTION - violation de clause WHERE 01402. 00000 -  "view WITH CHECK OPTION where-clause violation"
<!-- .element class="fragment error small" -->




### 3. Vue partielle
Créer une vue **v_departements** qui liste le numéro et le libellé des départements.
*Tester les opérations d’ajout et de mise à jour à travers cette vue. Que se passe-t-il ? Pourquoi ? Que peut-on changer ?*
<!-- .element class="small" -->

```sql
CREATE OR REPLACE VIEW v_departements AS
SELECT numero, libelle
FROM departements;
```
<!-- .element class="fragment col2 w-50 float-left"-->

```sql
SELECT * FROM v_departements;
```
<!-- .element class="run hide start-hidden" data-db="SQLAVANCE" -->



### 3. Vue partielle - LMD

Test INSERT

```sql
INSERT INTO v_departements (libelle) VALUES ('Logistique');
```
<!-- .element class="fragment" -->

Erreur SQL : ORA-01400: impossible d''insérer NULL dans ("SQLA_BERKANI"."SQLA_DEPARTEMENTS"."CODE") 01400. 00000 -  "cannot insert NULL into (%s)"
<!-- .element class="fragment error small" -->

Test UPDATE
<!-- .element class="fragment" -->
```sql
UPDATE v_departements1
   SET libelle = 'Achats et Stocks'
 WHERE numero = 3;
```
<!-- .element class="fragment" -->

Résultat: OK
<!-- .element class="fragment" -->




### 4a. Vue avec expression
Créer une vue **v_employes_age** qui liste le numéro, le code, le nom, le prénom et la date de naissance et l’âge des employés.

```sql
CREATE OR REPLACE VIEW v_employes_age (code, nom, prenom, date_naissance, age)
    AS SELECT code, nom, prenom, date_naissance,
           Trunc((sysdate - date_naissance)/365)
      FROM employes;
```
<!-- .element class="fragment" -->

```sql
CREATE OR REPLACE VIEW v_employes_age AS
      SELECT code, nom, prenom, date_naissance,
           Trunc((sysdate - date_naissance)/365) AS age
      FROM employes;
```
<!-- .element class="fragment" -->

```sql
SELECT * FROM v_employes_age;
```
<!-- .element class="run hide start-hidden" data-db="SQLAVANCE" -->




### 4b. Vue avec expression - LMD

Ajouter l’employé ci-dessous, a travers la vue

| code | nom     | prenom | date_naissance |
|------|---------|--------|----------------|
| ABA  | Babouin | Alfred | 08.04.1971     |

```sql
INSERT INTO v_employes_age(code, nom, prenom, date_naissance)
     VALUES ('ABA', 'Babouin', 'Alfred', To_Date('08.04.1961','dd.mm.yyyy'));
```
<!-- .element class="fragment" -->

Modifier le nom de ce (pauvre) homme en Baudoin.
<!-- .element class="fragment" -->

```sql
UPDATE v_employes_age
   SET nom = 'Baudoin'
 WHERE code = 'ABA';
```
<!-- .element class="fragment" -->




### 5. Vue avec fonction
Créer une vue **v_fonctions**(responsable, nombre) qui affiche l’état de la responsabilité (O,N) et le nombre de fonctions qui ont ces responsabilité.
*Tester les opérations LMD.*
<!-- .element class="small" -->

```sql
CREATE VIEW v_fonctions (responsable, nombre) AS
     SELECT a_responsabilite, COUNT(*)
       FROM fonctions
      GROUP BY a_responsabilite;
```
<!-- .element class="fragment w-66 float-left" -->

```sql
SELECT * FROM v_fonctions;
```
<!-- .element class="run hide start-hidden" data-db="SQLAVANCE" -->



### 5. Vue avec fonction - LMD

Requête avec un GROUP BY, donc une vue complexe

Résultats: INSERT, UPDATE, DELETE impossibles
<!-- .element class="error" -->




### 6. Vue complexe
Créer une vue **v_employes_resp** qui affiche les employés qui ont une responsabilité.

```sql
CREATE OR REPLACE VIEW v_employes_resp AS
    SELECT e.code, e.nom, e.prenom, e.date_naissance
      FROM employes e 
     INNER JOIN contrats c 
        ON e.numero = c.num_employe
     INNER JOIN fonctions f 
        ON f.numero = c.num_fonction
     WHERE f.a_responsabilite = 'O';
```
<!-- .element class="fragment" -->

```sql
SELECT * FROM v_employes_resp;
```
<!-- .element class="run hide start-hidden" data-db="SQLAVANCE" -->



### 6. Vue modifiable 

Faites que la mise à jours des employés puisse se faire par cette vue

```sql
CREATE OR REPLACE VIEW v_employes_resp2 AS
SELECT e.code, e.nom, e.prenom, e.date_naissance
 FROM employes e
WHERE e.numero in (SELECT c.num_employe
                   FROM contrats c 
                     INNER JOIN fonctions f 
                       ON f.numero = c.num_fonction
                   Where f.a_responsabilite = 'O');
```
<!-- .element class="fragment" -->

```sql
SELECT * FROM v_employes_resp2;
```
<!-- .element class="run hide start-hidden" data-db="SQLAVANCE" -->

Impact si on ajoute WITH CHECK OPTIONS?
<!-- .element class="fragment" -->




### 7. Vue de vue (hard) 
Créer une vue **v_employes_stars** qui affiche les employés les mieux payés pour chaque département.

*(Astuce: procédé par étapes/plusieurs vues : salaires maximum par département, salaires et départements des employés)*
<!-- .element class="small" -->



### 7a. salaires maximum par département

```sql
CREATE VIEW v_salaire_max_dep AS 
    SELECT fonct.num_departement, dep.libelle,
         MAX(cont.salaire_mensuel) AS salaire_mensuel_max
      FROM contrats cont
     INNER JOIN fonctions fonct
        ON fonct.numero = cont.num_fonction
     INNER JOIN departements dep
        ON dep.numero = fonct.num_departement
     GROUP BY fonct.num_departement, dep.libelle;
```

```sql
SELECT * FROM v_salaire_max_dep;
```
<!-- .element class="run hide" data-db="SQLAVANCE" -->



### 7b. salaires et départements des employés

```sql
CREATE OR REPLACE VIEW v_salaires(code_emp, nom, prenom, departement,
                       num_departement, salaire_mensuel) AS
    SELECT emp.code, emp.nom, emp.prenom, dep.libelle,
           fonc.num_departement, cont.salaire_mensuel
      FROM contrats cont
     INNER JOIN fonctions fonc
        ON fonc.numero = cont.num_fonction
     INNER JOIN employes emp
        ON emp.numero = cont.num_employe
     INNER JOIN departements dep
        ON dep.numero = fonc.num_departement;
```

```sql
SELECT * FROM v_salaires;
```
<!-- .element class="run hide" data-db="SQLAVANCE" -->



```sql
SELECT * FROM v_salaire_max_dep;
```
<!-- .element class="top left run hide w-100" data-db="SQLAVANCE" -->

```sql
SELECT * FROM v_salaires;
```
<!-- .element class="run hide bottom right" data-db="SQLAVANCE" -->



![](/images/vues/view_join1.png)
<!-- .element class="top"-->
![](/images/vues/view_join2.png)
<!-- .element class="fragment top"-->



### 7c. les employés les mieux payés pour chaque département

```sql
CREATE OR REPLACE VIEW v_employes_stars AS 
    SELECT v_salaires.*
      FROM v_salaires
     INNER JOIN v_salaire_max_dep
        ON v_salaires.num_departement = v_salaire_max_dep.num_departement
       AND v_salaires.salaire_mensuel = v_salaire_max_dep.salaire_mensuel_max;
```

```sql
SELECT * FROM v_employes_stars;
```
<!-- .element class="run hide" data-db="SQLAVANCE" -->



### 7c' les employés les mieux payés pour chaque département (variante)

```sql
CREATE OR REPLACE VIEW v_employes_stars AS 
    SELECT v_salaires.*
      FROM v_salaires
     WHERE (v_salaires.NUM_DEPARTEMENT, v_salaires.SALAIRE_MENSUEL) IN (
            SELECT v_salaire_max_dep.NUM_DEPARTEMENT,
                   v_salaire_max_dep.SALAIRE_MENSUEL_MAX
              FROM v_salaire_max_dep
             );

```

```sql
SELECT * FROM v_employes_stars;
```
<!-- .element class="run hide" data-db="SQLAVANCE" -->



Avec une seule vue
```sql
-- CREATE OR REPLACE VIEW v_employes_stars AS 
SELECT emp.code AS code_emp, emp.nom, emp.PRENOM, dep.libelle AS departement,
       dep.numero, cont.salaire_mensuel
  FROM contrats cont
 INNER JOIN fonctions fonc
    ON fonc.numero = cont.num_fonction
 INNER JOIN employes emp
    ON emp.NUMERO = cont.num_employe
 INNER JOIN departements dep
    ON dep.NUMERO = fonc.num_departement
 WHERE ( fonc.num_departement, cont.salaire_mensuel) IN (
             SELECT fonct.num_departement, Max(cont.salaire_mensuel)
               FROM contrats cont
              INNER JOIN fonctions fonct
                 ON fonct.numero = cont.num_fonction
              GROUP BY fonct.num_departement )
ORDER BY emp.nom,  emp.prenom; 
```
<!-- .element class="run" data-db="SQLAVANCE" -->




### 8. Vue de vue2 (hard)
Créer une vue **v_vieux_informaticiens** qui affiche les employés sans responsabilités appartenant au département informatique, dont l’âge est supérieure à la moyenne des employés qui ont une responsabilité, tous départements confondus.

*Astuce: procédé par étapes/plusieurs vues : Liste des employés « inf » sans responsabilité, Moyenne d'âge des employés a responsabilité*
<!-- .element class="small" -->



### 8a. Liste des employes informaticien sans responsabilité

```sql
CREATE VIEW v_inf_sans_resp AS SELECT emp.code, emp.nom, emp.prenom,
           (sysdate -  emp.date_naissance) /365 as age
      FROM employes emp
INNER JOIN contrats contr ON emp.numero = contr.num_employe
INNER JOIN fonctions fonct ON fonct.numero = contr.num_fonction
INNER JOIN departements dep ON dep.numero = fonct.num_departement
     WHERE fonct.a_responsabilite = 'N' AND dep.CODE = 'INF';
```

```sql
SELECT * FROM v_inf_sans_resp;
```
<!-- .element class="run hide" data-db="SQLAVANCE" -->



### 8b. Moyenne d'âge des employés à responsabilité
```sql
CREATE VIEW v_moyenne_age_res AS 
     SELECT AVG((sysdate - emp.date_naissance) / 365) as age
       FROM employes emp
 INNER JOIN contrats cont ON emp.numero = cont.num_employe
 INNER JOIN fonctions fonct ON fonct.numero = cont.num_fonction
      WHERE fonct.a_responsabilite = 'O';
```

```sql
SELECT * FROM v_moyenne_age_res;
```
<!-- .element class="run hide" data-db="SQLAVANCE" -->



### 8c. Vieux informaticiens

```sql 
CREATE VIEW v_vieux_informaticiens AS 
     SELECT *
       FROM v_inf_sans_resp
      WHERE age > (SELECT age
                     FROM v_moyenne_age_res);
```

```sql
SELECT * FROM v_vieux_informaticiens;
```
<!-- .element class="run hide" data-db="SQLAVANCE" -->



Avec une seule vue
```sql
-- CREATE OR REPLACE VIEW v_vieux_informaticiens AS 
SELECT emp.code, emp.nom, emp.prenom, (sysdate -  emp.date_naissance)/365 age
  FROM employes emp
 INNER JOIN contrats contr ON emp.numero = contr.num_employe
 INNER JOIN fonctions fonct ON fonct.numero = contr.num_fonction
 INNER JOIN departements dep ON dep.numero = fonct.num_departement
 WHERE fonct.a_responsabilite = 'N' AND dep.code = 'INF'
   AND ((sysdate -  emp.date_naissance)/365) > (
               SELECT AVG( (sysdate -  employes.date_naissance) /365)
                 FROM employes
           INNER JOIN contrats ON employes.numero = contrats.num_employe
           INNER JOIN fonctions ON fonctions.numero = contrats.num_fonction
                WHERE fonctions.a_responsabilite = 'O');
```
<!-- .element class="run" data-db="SQLAVANCE" -->