import { pool } from "../src/infrastructure/db/pool";

const categories = [
  "Analgesicos",
  "Antiinflamatorios",
  "Antihistaminicos",
  "Gastrointestinal",
  "Antibioticos",
  "Cardiovascular",
  "Respiratorio",
  "Endocrino",
  "Dermatologico",
  "Neurologico",
];

const laboratories = ["Andes Pharma", "NovaSalud", "BioCentral", "Laboratorio Horizonte", "Vitalis Demo"];

const medicines = [
  ["MED-001", "Acetaminofen 500 mg", "Acetaminofen", "Tabletas x 20", "Dolor leve a moderado y fiebre", 890000, 80, false, 0, 0],
  ["MED-002", "Ibuprofeno 400 mg", "Ibuprofeno", "Tabletas x 20", "Dolor e inflamacion", 1250000, 70, false, 1, 1],
  ["MED-003", "Naproxeno 250 mg", "Naproxeno", "Tabletas x 20", "Dolor musculoesqueletico", 1540000, 45, false, 1, 2],
  ["MED-004", "Loratadina 10 mg", "Loratadina", "Tabletas x 10", "Sintomas de alergia", 980000, 65, false, 2, 3],
  ["MED-005", "Cetirizina 10 mg", "Cetirizina", "Tabletas x 10", "Rinitis alergica", 1030000, 52, false, 2, 4],
  ["MED-006", "Omeprazol 20 mg", "Omeprazol", "Capsulas x 14", "Acidez y reflujo", 1190000, 60, false, 3, 0],
  ["MED-007", "Esomeprazol 20 mg", "Esomeprazol", "Capsulas x 14", "Reflujo gastroesofagico", 1890000, 38, false, 3, 1],
  ["MED-008", "Amoxicilina 500 mg", "Amoxicilina", "Capsulas x 21", "Infecciones bacterianas sensibles", 2290000, 35, true, 4, 2],
  ["MED-009", "Azitromicina 500 mg", "Azitromicina", "Tabletas x 3", "Infecciones bacterianas sensibles", 2650000, 28, true, 4, 3],
  ["MED-010", "Cefalexina 500 mg", "Cefalexina", "Capsulas x 20", "Infecciones bacterianas sensibles", 2490000, 30, true, 4, 4],
  ["MED-011", "Losartan 50 mg", "Losartan", "Tabletas x 30", "Tratamiento de hipertension", 1780000, 55, true, 5, 0],
  ["MED-012", "Amlodipino 5 mg", "Amlodipino", "Tabletas x 30", "Tratamiento de hipertension", 1430000, 50, true, 5, 1],
  ["MED-013", "Enalapril 20 mg", "Enalapril", "Tabletas x 30", "Control de hipertension", 1520000, 44, true, 5, 2],
  ["MED-014", "Salbutamol inhalador", "Salbutamol", "Inhalador 100 mcg", "Alivio de broncoespasmo", 2890000, 25, true, 6, 3],
  ["MED-015", "Budesonida inhalador", "Budesonida", "Inhalador 200 dosis", "Control de inflamacion respiratoria", 4190000, 20, true, 6, 4],
  ["MED-016", "Metformina 850 mg", "Metformina", "Tabletas x 30", "Control glucemico en diabetes tipo 2", 1670000, 58, true, 7, 0],
  ["MED-017", "Levotiroxina 50 mcg", "Levotiroxina", "Tabletas x 50", "Tratamiento de hipotiroidismo", 1980000, 40, true, 7, 1],
  ["MED-018", "Clotrimazol crema 1%", "Clotrimazol", "Tubo 20 g", "Infecciones fungicas superficiales", 1320000, 36, false, 8, 2],
  ["MED-019", "Hidrocortisona crema 1%", "Hidrocortisona", "Tubo 20 g", "Inflamacion cutanea leve", 1490000, 33, false, 8, 3],
  ["MED-020", "Gabapentina 300 mg", "Gabapentina", "Capsulas x 30", "Dolor neuropatico", 3150000, 24, true, 9, 4],
  ["MED-021", "Diclofenaco gel 1%", "Diclofenaco", "Tubo 50 g", "Dolor e inflamacion localizada", 1710000, 47, false, 1, 0],
  ["MED-022", "Diclofenaco 50 mg", "Diclofenaco", "Tabletas x 20", "Dolor e inflamacion", 1380000, 41, true, 1, 1],
  ["MED-023", "Fexofenadina 120 mg", "Fexofenadina", "Tabletas x 10", "Alergias estacionales", 2040000, 29, false, 2, 2],
  ["MED-024", "Famotidina 20 mg", "Famotidina", "Tabletas x 20", "Acidez gastrica", 1270000, 39, false, 3, 3],
  ["MED-025", "Claritromicina 500 mg", "Claritromicina", "Tabletas x 14", "Infecciones bacterianas sensibles", 3470000, 18, true, 4, 4],
  ["MED-026", "Hidroclorotiazida 25 mg", "Hidroclorotiazida", "Tabletas x 30", "Control de hipertension", 1210000, 48, true, 5, 0],
  ["MED-027", "Atorvastatina 20 mg", "Atorvastatina", "Tabletas x 30", "Control de colesterol", 2250000, 43, true, 5, 1],
  ["MED-028", "Montelukast 10 mg", "Montelukast", "Tabletas x 30", "Control de asma y alergia", 2980000, 31, true, 6, 2],
  ["MED-029", "Insulina glargina demo", "Insulina glargina", "Pluma prellenada", "Control glucemico", 8450000, 16, true, 7, 3],
  ["MED-030", "Ketoconazol shampoo 2%", "Ketoconazol", "Frasco 120 ml", "Dermatitis seborreica", 2380000, 27, false, 8, 4],
  ["MED-031", "Pregabalina 75 mg", "Pregabalina", "Capsulas x 30", "Dolor neuropatico", 4580000, 22, true, 9, 0],
  ["MED-032", "Acetaminofen jarabe", "Acetaminofen", "Frasco 120 ml", "Fiebre y dolor", 1160000, 62, false, 0, 1],
  ["MED-033", "Ibuprofeno suspension", "Ibuprofeno", "Frasco 120 ml", "Dolor y fiebre", 1390000, 49, false, 1, 2],
  ["MED-034", "Desloratadina 5 mg", "Desloratadina", "Tabletas x 10", "Alergia", 1560000, 37, false, 2, 3],
  ["MED-035", "Sucralfato 1 g", "Sucralfato", "Tabletas x 30", "Proteccion gastrica", 1920000, 34, true, 3, 4],
  ["MED-036", "Doxiciclina 100 mg", "Doxiciclina", "Capsulas x 10", "Infecciones bacterianas sensibles", 2740000, 26, true, 4, 0],
  ["MED-037", "Metoprolol 50 mg", "Metoprolol", "Tabletas x 30", "Control cardiovascular", 1830000, 32, true, 5, 1],
  ["MED-038", "Ipratropio inhalador", "Ipratropio", "Inhalador", "Broncodilatacion", 3620000, 21, true, 6, 2],
  ["MED-039", "Glibenclamida 5 mg", "Glibenclamida", "Tabletas x 30", "Control glucemico", 1280000, 46, true, 7, 3],
  ["MED-040", "Mupirocina ungüento 2%", "Mupirocina", "Tubo 15 g", "Infecciones cutaneas bacterianas", 2570000, 23, true, 8, 4],
  ["MED-041", "Carbamazepina 200 mg", "Carbamazepina", "Tabletas x 30", "Tratamiento neurologico", 2890000, 19, true, 9, 0],
  ["MED-042", "Acido acetilsalicilico 100 mg", "Acido acetilsalicilico", "Tabletas x 30", "Uso cardiovascular indicado por profesional", 1010000, 53, true, 5, 1],
  ["MED-043", "Meloxicam 15 mg", "Meloxicam", "Tabletas x 10", "Dolor e inflamacion", 1740000, 30, true, 1, 2],
  ["MED-044", "Pantoprazol 40 mg", "Pantoprazol", "Tabletas x 14", "Reflujo y acidez", 2090000, 35, true, 3, 3],
  ["MED-045", "Ciprofloxacino 500 mg", "Ciprofloxacino", "Tabletas x 10", "Infecciones bacterianas sensibles", 3260000, 17, true, 4, 4],
  ["MED-046", "Valsartan 80 mg", "Valsartan", "Tabletas x 30", "Tratamiento de hipertension", 2630000, 28, true, 5, 0],
  ["MED-047", "Beclometasona inhalador", "Beclometasona", "Inhalador", "Control del asma", 3870000, 20, true, 6, 1],
  ["MED-048", "Linagliptina 5 mg", "Linagliptina", "Tabletas x 30", "Control de diabetes tipo 2", 5920000, 15, true, 7, 2],
  ["MED-049", "Betametasona crema 0.05%", "Betametasona", "Tubo 20 g", "Inflamacion cutanea", 1860000, 24, true, 8, 3],
  ["MED-050", "Amitriptilina 25 mg", "Amitriptilina", "Tabletas x 30", "Uso neurologico bajo prescripcion", 2140000, 27, true, 9, 4]
] as const;

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const name of categories) {
      await client.query("INSERT INTO categories(name) VALUES ($1) ON CONFLICT (name) DO NOTHING", [name]);
    }
    for (const name of laboratories) {
      await client.query("INSERT INTO laboratories(name) VALUES ($1) ON CONFLICT (name) DO NOTHING", [name]);
    }

    const categoryRows = await client.query<{ id: string; name: string }>("SELECT id, name FROM categories");
    const labRows = await client.query<{ id: string; name: string }>("SELECT id, name FROM laboratories");
    const categoryIds = new Map(categoryRows.rows.map((r) => [r.name, r.id]));
    const labIds = new Map(labRows.rows.map((r) => [r.name, r.id]));

    for (const row of medicines) {
      const [sku, name, activeIngredient, presentation, indications, priceCents, stock, requiresPrescription, categoryIndex, labIndex] = row;
      await client.query(
        `INSERT INTO medicines
          (sku, name, active_ingredient, presentation, indications, price_cents, stock, requires_prescription, category_id, laboratory_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (sku) DO UPDATE SET
          name = EXCLUDED.name,
          active_ingredient = EXCLUDED.active_ingredient,
          presentation = EXCLUDED.presentation,
          indications = EXCLUDED.indications,
          price_cents = EXCLUDED.price_cents,
          requires_prescription = EXCLUDED.requires_prescription,
          category_id = EXCLUDED.category_id,
          laboratory_id = EXCLUDED.laboratory_id`,
        [
          sku,
          name,
          activeIngredient,
          presentation,
          indications,
          priceCents,
          stock,
          requiresPrescription,
          categoryIds.get(categories[categoryIndex]),
          labIds.get(laboratories[labIndex]),
        ],
      );
    }

    await client.query("COMMIT");
    console.log(`[db] seeded ${medicines.length} demo medicines`);
    console.log("[db] IMPORTANT: replace demo seed with the instructor-provided dataset before final submission.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
