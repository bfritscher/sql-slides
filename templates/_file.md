# <%= filename %>




## new slide
![](/images/vues/schema.png)


<!-- .element class="smaller" -->
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
<!-- .element class="run hide col2 start-hidden" data-db="SQLAVANCE" -->



### 1. sub slide
