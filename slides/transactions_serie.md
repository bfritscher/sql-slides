##Série 4
#Transactions

---
![](/images/vues/schema.png)

---
### 1. COMMIT

Ajouter un département *TEST* puis visualiser le contenu de la table.
Ensuite annuler l’insertion (ROLLBACK) puis visualiser à nouveau le contenu.

```sql
INSERT INTO departements VALUES (seq_departements.nextval, 'TEST', 'Test');
```

```sql
SELECT * FROM departements;
```

```sql
ROLLBACK;
```

```sql
SELECT * FROM departements;
```

---
### 2. Sessions
Ouvrir deux sessions dans la base de données
*(ouvrir 2 fois SQLDeveloper avec connexions)*<!-- .element class="small" -->

![](/images/transactions/unshared_worksheet.png)<!-- .element class="no-margin" -->
*ou utiliser le bouton "unshared worksheet"*
<!-- .element class="small" -->

Tester la suite des opérations ci-dessous:


| Session 1                  | Session 2                  |
|----------------------------|----------------------------|
| INSERT INTO departements   |                            |
| SELECT * FROM departements |                            |
|                            | SELECT * FROM departements |
| COMMIT                     |                            |
|                            | SELECT * FROM departements |
|                            |                            |
<!-- .element class="stretch" -->

---
### 3. Evaluation de deux sessions
Vous disposez d’une table test qui contient un seul champ: **valeur**

Deux sessions accèdent à cette table **sans utiliser** votre ordinateur et en sachant que la table test est vide au départ:

* Remplir les colonnes résultat en donnant le contenu du champ valeur.
* Mettre en évidence les lignes de ce tableau qui font partie d’une même transaction.

Téléchargez: [serie3.3-evaluation_de_deux_sessions.pdf](/slides/transactions_serie3.3-evaluation_de_deux_sessions.pdf)

@@@

![](/images/transactions/evaluation_de_deux_sessions.png)

<!-- .element class="center" -->

---
### 4. Transaction
Vous devez changer le contrat d’un employé (changement de fonction). 

Valérie Durand (VDU) à la fonction de comptable (CPT) Depuis aujourd’hui, elle à la fonction de contrôleur (CTR) pour un salaire mensuel de 8000.-

Ecrire la transaction pour réaliser cette opération
*Astuce : (Mettre fin à son contrat actuel et insérer un nouveau)*

@@@
### 4. Transaction
```sql
COMMIT;

-- opération 1
UPDATE contrats
   SET date_fin = Sysdate
 WHERE num_employe = (SELECT numero FROM employes WHERE code = 'VDU') 
   AND date_fin IS NULL ;
   
-- opération 2
INSERT INTO contrats (num_employe, num_fonction,
                      salaire_mensuel, date_debut )
         SELECT numero, (SELECT numero FROM fonctions WHERE code = 'CTR'),
                8000, sysdate
           FROM employes
          WHERE code = 'VDU';
          
COMMIT; -- fin de la transaction
```

---
### 5. Verification métier 1
Est-ce qu’il existe des employés qui ont plusieurs contrats ouverts ?

Ecrire une requête qui liste les nom et prénom des employés qui ont plusieurs contrats sans date de fin

```sql
SELECT nom, prenom
  FROM employes
 WHERE numero IN (SELECT num_employe
                    FROM contrats
                   WHERE date_fin IS NULL
                GROUP BY num_employe
                  HAVING COUNT(*) > 1);
```
<!-- .element class="run col2 fragment start-hidden" data-fragment-index="1"  data-output-fragment-index="0"  data-db="SQLAVANCE" -->

---
### 6. Vérification métier 2

Est-ce qu'il existe des employés qui ont des contrats qui se chevauchent ?

Ecrire une requête qui liste leurs dates de début et de fin.
*Ne tester que si la date de fin du contrat X est plus grande que la date de début du contrat Y*
<!-- .element class="small" -->

```sql
SELECT p.num_employe, p.date_debut, p.date_fin,
       s.date_debut, s.date_fin
  FROM contrats p
 INNER JOIN contrats s ON p.num_employe = s.num_employe
   AND p.num_fonction <> s.num_fonction
 WHERE p.date_fin IS NOT Null
   AND p.date_fin > s.date_debut;
```
<!-- .element class="run col2 fragment start-hidden" data-fragment-index="1"  data-output-fragment-index="0"  data-db="SQLAVANCE" -->