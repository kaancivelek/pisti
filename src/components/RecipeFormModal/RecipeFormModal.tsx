"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./RecipeFormModal.module.css";
import { IngredientGroup, InstructionGroup } from "@/lib/models/Recipe";

interface RecipeFormData {
  title: string;
  shortTitle: string;
  categoryName: string;
  contentText: string;
  imageUrl: string;
  featuredImageAlt: string;
  cookTime: number | "";
  cookTimeUnit: string;
  prepTime: number | "";
  prepTimeUnit: string;
  servings: number | "";
  servingUnit: string;
  perServingCalories: number | "";
  ingredientGroups: IngredientGroup[];
  instructionGroups: InstructionGroup[];
}

interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRecipeId?: string | null;
}

const defaultForm: RecipeFormData = {
  title: "",
  shortTitle: "",
  categoryName: "",
  contentText: "",
  imageUrl: "",
  featuredImageAlt: "",
  cookTime: "",
  cookTimeUnit: "dakika",
  prepTime: "",
  prepTimeUnit: "dakika",
  servings: "",
  servingUnit: "kişilik",
  perServingCalories: "",
  ingredientGroups: [{ items: [{ name: "", amount: "", unit: "" }] }],
  instructionGroups: [{ instructions: [{ description: "", order: 1 }] }],
};

const CATEGORIES = [
  "Zeytinyağlı", "Et Yemekleri", "Tavuk Yemekleri", "Balık & Deniz Ürünleri",
  "Çorbalar", "Salatalar", "Kahvaltılık", "Tatlılar", "Pastalar & Börekler",
  "İçecekler", "Vejetaryen", "Vegan", "Aperatifler", "Makarna & Pirinç",
];

const TIME_UNITS = ["dakika", "saat", "gün"];

export default function RecipeFormModal({ isOpen, onClose, onSuccess, editRecipeId }: RecipeFormModalProps) {
  const [form, setForm] = useState<RecipeFormData>(defaultForm);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editRecipeId;

  const fetchRecipe = useCallback(async () => {
    if (!editRecipeId) return;
    setFetchLoading(true);
    try {
      const res = await fetch(`/api/recipes/${editRecipeId}`);
      if (!res.ok) throw new Error("Tarif yüklenemedi.");
      const data = await res.json();
      setForm({
        title: data.title || "",
        shortTitle: data.shortTitle || "",
        categoryName: data.categoryName || "",
        contentText: data.contentText || "",
        imageUrl: data.imageUrl || "",
        featuredImageAlt: data.featuredImageAlt || "",
        cookTime: data.cookTime ?? "",
        cookTimeUnit: data.cookTimeUnit || "dakika",
        prepTime: data.prepTime ?? "",
        prepTimeUnit: data.prepTimeUnit || "dakika",
        servings: data.servings ?? "",
        servingUnit: data.servingUnit || "kişilik",
        perServingCalories: data.perServingCalories ?? "",
        ingredientGroups: data.ingredientGroups?.length
          ? data.ingredientGroups
          : [{ items: [{ name: "", amount: "", unit: "" }] }],
        instructionGroups: data.instructionGroups?.length
          ? data.instructionGroups
          : [{ instructions: [{ description: "", order: 1 }] }],
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Tarif yüklenemedi.");
    } finally {
      setFetchLoading(false);
    }
  }, [editRecipeId]);

  // Reset form state when the modal opens
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: reset modal state on open transition
  useEffect(() => {
    if (isOpen) {
      setActiveStep(0);
      setError(null);
      if (isEditMode) {
        fetchRecipe();
      } else {
        setForm(defaultForm);
      }
    }
  }, [isOpen, isEditMode, fetchRecipe]);

  // Overlay click close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Generic field change
  const handleChange = (field: keyof RecipeFormData, value: RecipeFormData[keyof RecipeFormData]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Ingredient handlers
  const addIngredient = (groupIdx: number) => {
    const groups = [...form.ingredientGroups];
    groups[groupIdx].items.push({ name: "", amount: "", unit: "" });
    handleChange("ingredientGroups", groups);
  };
  const removeIngredient = (groupIdx: number, itemIdx: number) => {
    const groups = [...form.ingredientGroups];
    groups[groupIdx].items.splice(itemIdx, 1);
    handleChange("ingredientGroups", groups);
  };
  const updateIngredient = (groupIdx: number, itemIdx: number, field: string, value: string) => {
    const groups = [...form.ingredientGroups];
    const items = [...groups[groupIdx].items];
    const item = { ...items[itemIdx], [field]: value };
    items[itemIdx] = item;
    groups[groupIdx] = { ...groups[groupIdx], items };
    handleChange("ingredientGroups", groups);
  };

  // Instruction handlers
  const addInstruction = (groupIdx: number) => {
    const groups = [...form.instructionGroups];
    const order = groups[groupIdx].instructions.length + 1;
    groups[groupIdx].instructions.push({ description: "", order });
    handleChange("instructionGroups", groups);
  };
  const removeInstruction = (groupIdx: number, itemIdx: number) => {
    const groups = [...form.instructionGroups];
    groups[groupIdx].instructions.splice(itemIdx, 1);
    // Reorder
    groups[groupIdx].instructions = groups[groupIdx].instructions.map((ins, i) => ({ ...ins, order: i + 1 }));
    handleChange("instructionGroups", groups);
  };
  const updateInstruction = (groupIdx: number, itemIdx: number, value: string) => {
    const groups = [...form.instructionGroups];
    groups[groupIdx].instructions[itemIdx].description = value;
    handleChange("instructionGroups", groups);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        cookTime: form.cookTime === "" ? undefined : Number(form.cookTime),
        prepTime: form.prepTime === "" ? undefined : Number(form.prepTime),
        servings: form.servings === "" ? undefined : Number(form.servings),
        perServingCalories: form.perServingCalories === "" ? undefined : Number(form.perServingCalories),
      };

      const url = isEditMode ? `/api/recipes/${editRecipeId}` : "/api/recipes";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu.");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Temel Bilgiler", "Malzemeler", "Hazırlanışı", "Önizleme"];

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEditMode ? "Tarifi Düzenle" : "Yeni Tarif Ekle"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Kapat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step Indicators */}
        <div className={styles.stepBar}>
          {steps.map((step, i) => (
            <button
              key={step}
              className={`${styles.stepBtn} ${i === activeStep ? styles.stepActive : ""} ${i < activeStep ? styles.stepDone : ""}`}
              onClick={() => setActiveStep(i)}
            >
              <span className={styles.stepNum}>{i < activeStep ? "✓" : i + 1}</span>
              <span className={styles.stepLabel}>{step}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {fetchLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Tarif yükleniyor...</p>
            </div>
          ) : (
            <>
              {/* STEP 0: Temel Bilgiler */}
              {activeStep === 0 && (
                <div className={styles.formStep}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tarif Başlığı *</label>
                    <input
                      className={styles.input}
                      placeholder="Örn: Zeytinyağlı Enginar"
                      value={form.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Kısa Başlık</label>
                    <input
                      className={styles.input}
                      placeholder="Kısa bir başlık"
                      value={form.shortTitle}
                      onChange={(e) => handleChange("shortTitle", e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Kategori *</label>
                    <select
                      className={styles.select}
                      value={form.categoryName}
                      onChange={(e) => handleChange("categoryName", e.target.value)}
                    >
                      <option value="">Kategori seçin</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tarif Açıklaması *</label>
                    <textarea
                      className={styles.textarea}
                      rows={5}
                      placeholder="Tarifinizi kısaca anlatın..."
                      value={form.contentText}
                      onChange={(e) => handleChange("contentText", e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Fotoğraf URL</label>
                    <input
                      className={styles.input}
                      placeholder="https://..."
                      value={form.imageUrl}
                      onChange={(e) => handleChange("imageUrl", e.target.value)}
                    />
                  </div>
                  {form.imageUrl && (
                    <div className={styles.imagePreview}>
                      <Image src={form.imageUrl} alt="Önizleme" width={400} height={300} onError={(e) => (e.currentTarget.style.display = "none")} />
                    </div>
                  )}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Hazırlık Süresi</label>
                      <div className={styles.inputWithUnit}>
                        <input
                          className={styles.input}
                          type="number"
                          min={0}
                          placeholder="30"
                          value={form.prepTime}
                          onChange={(e) => handleChange("prepTime", e.target.value)}
                        />
                        <select className={styles.unitSelect} value={form.prepTimeUnit} onChange={(e) => handleChange("prepTimeUnit", e.target.value)}>
                          {TIME_UNITS.map((u) => <option key={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Pişirme Süresi</label>
                      <div className={styles.inputWithUnit}>
                        <input
                          className={styles.input}
                          type="number"
                          min={0}
                          placeholder="20"
                          value={form.cookTime}
                          onChange={(e) => handleChange("cookTime", e.target.value)}
                        />
                        <select className={styles.unitSelect} value={form.cookTimeUnit} onChange={(e) => handleChange("cookTimeUnit", e.target.value)}>
                          {TIME_UNITS.map((u) => <option key={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Kaç Kişilik</label>
                      <div className={styles.inputWithUnit}>
                        <input
                          className={styles.input}
                          type="number"
                          min={1}
                          placeholder="4"
                          value={form.servings}
                          onChange={(e) => handleChange("servings", e.target.value)}
                        />
                        <input
                          className={styles.unitInput}
                          placeholder="kişilik"
                          value={form.servingUnit}
                          onChange={(e) => handleChange("servingUnit", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Kalori (kişi başı)</label>
                      <input
                        className={styles.input}
                        type="number"
                        min={0}
                        placeholder="143"
                        value={form.perServingCalories}
                        onChange={(e) => handleChange("perServingCalories", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: Malzemeler */}
              {activeStep === 1 && (
                <div className={styles.formStep}>
                  {form.ingredientGroups.map((group, gi) => (
                    <div key={gi} className={styles.group}>
                      <div className={styles.groupHeader}>
                        <span className={styles.groupTitle}>Malzemeler</span>
                      </div>
                      {group.items.map((item, ii) => (
                        <div key={ii} className={styles.ingredientRow}>
                          <input
                            className={`${styles.input} ${styles.amountInput}`}
                            placeholder="Miktar"
                            value={item.amount || ""}
                            onChange={(e) => updateIngredient(gi, ii, "amount", e.target.value)}
                          />
                          <input
                            className={`${styles.input} ${styles.unitInputSmall}`}
                            placeholder="Birim"
                            value={item.unit || ""}
                            onChange={(e) => updateIngredient(gi, ii, "unit", e.target.value)}
                          />
                          <input
                            className={`${styles.input} ${styles.nameInput}`}
                            placeholder="Malzeme adı *"
                            value={item.name}
                            onChange={(e) => updateIngredient(gi, ii, "name", e.target.value)}
                          />
                          <button
                            className={styles.removeBtn}
                            onClick={() => removeIngredient(gi, ii)}
                            disabled={group.items.length === 1}
                            title="Sil"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button className={styles.addItemBtn} onClick={() => addIngredient(gi)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Malzeme Ekle
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 2: Hazırlanışı */}
              {activeStep === 2 && (
                <div className={styles.formStep}>
                  {form.instructionGroups.map((group, gi) => (
                    <div key={gi} className={styles.group}>
                      <div className={styles.groupHeader}>
                        <span className={styles.groupTitle}>Hazırlanış Adımları</span>
                      </div>
                      {group.instructions.map((ins, ii) => (
                        <div key={ii} className={styles.instructionRow}>
                          <span className={styles.stepNumber}>{ii + 1}</span>
                          <textarea
                            className={`${styles.textarea} ${styles.instructionTextarea}`}
                            rows={2}
                            placeholder={`${ii + 1}. adımı yazın...`}
                            value={ins.description}
                            onChange={(e) => updateInstruction(gi, ii, e.target.value)}
                          />
                          <button
                            className={styles.removeBtn}
                            onClick={() => removeInstruction(gi, ii)}
                            disabled={group.instructions.length === 1}
                            title="Sil"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button className={styles.addItemBtn} onClick={() => addInstruction(gi)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Adım Ekle
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3: Preview */}
              {activeStep === 3 && (
                <div className={styles.formStep}>
                  <div className={styles.preview}>
                    {form.imageUrl && (
                      <Image className={styles.previewImage} src={form.imageUrl} alt={form.title} width={600} height={400} />
                    )}
                    <div className={styles.previewBadge}>{form.categoryName || "Kategori yok"}</div>
                    <h3 className={styles.previewTitle}>{form.title || "Başlık girilmedi"}</h3>
                    <div className={styles.previewMeta}>
                      {form.prepTime && <span>Hazırlık: {form.prepTime} {form.prepTimeUnit}</span>}
                      {form.cookTime && <span>Pişirme: {form.cookTime} {form.cookTimeUnit}</span>}
                      {form.servings && <span>{form.servings} {form.servingUnit}</span>}
                      {form.perServingCalories && <span>{form.perServingCalories} kcal</span>}
                    </div>
                    <div className={styles.previewSection}>
                      <strong>Malzemeler</strong>
                      <ul className={styles.previewList}>
                        {form.ingredientGroups[0]?.items.filter(i => i.name).map((item, i) => (
                          <li key={i}>{[item.amount, item.unit, item.name].filter(Boolean).join(" ")}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.previewSection}>
                      <strong>Hazırlanışı</strong>
                      <ol className={styles.previewList}>
                        {form.instructionGroups[0]?.instructions.filter(i => i.description).map((ins, i) => (
                          <li key={i}>{ins.description}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className={styles.errorMsg}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            className={`btn btn-outline ${styles.navBtn}`}
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            disabled={activeStep === 0}
          >
            ← Geri
          </button>
          <div className={styles.stepDots}>
            {steps.map((_, i) => (
              <span key={i} className={`${styles.dot} ${i === activeStep ? styles.dotActive : ""} ${i < activeStep ? styles.dotDone : ""}`} />
            ))}
          </div>
          {activeStep < steps.length - 1 ? (
            <button
              className={`btn btn-primary ${styles.navBtn}`}
              onClick={() => setActiveStep((s) => Math.min(steps.length - 1, s + 1))}
              disabled={activeStep === 0 && (!form.title || !form.categoryName || !form.contentText)}
            >
              İleri →
            </button>
          ) : (
            <button
              className={`btn btn-primary ${styles.navBtn}`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : isEditMode ? "Güncelle" : "Tarifi Kaydet"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
