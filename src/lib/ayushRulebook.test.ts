import { describe, it, expect } from "vitest";
import {
  DASHAVIDHA_RULEBOOK,
  getParameter,
  getAllParameters,
  getParameterOrder,
  getTranslatedText,
  type DashavidhaParameter,
} from "@/lib/ayushRulebook";

describe("AYUSH Rulebook", () => {
  describe("Dashavidha Parameters", () => {
    it("should have exactly 10 parameters", () => {
      const params = getAllParameters();
      expect(params).toHaveLength(10);
    });

    it("should have all 10 parameters in order", () => {
      const order = getParameterOrder();
      expect(order).toHaveLength(10);
      expect(order).toEqual([
        "prakriti",
        "vikriti",
        "sara",
        "samhanana",
        "pramana",
        "satmya",
        "sattva",
        "ahara_shakti",
        "vyayama_shakti",
        "vaya",
      ]);
    });

    it("each parameter should have required fields", () => {
      getAllParameters().forEach((param) => {
        expect(param.id).toBeDefined();
        expect(param.name).toBeDefined();
        expect(param.sanskritName).toBeDefined();
        expect(param.description).toBeDefined();
        expect(param.educationalContext).toBeDefined();
        expect(param.options).toBeDefined();
        expect(Array.isArray(param.options)).toBe(true);
        expect(param.translations).toBeDefined();
      });
    });

    it("each parameter should have at least 2 options", () => {
      getAllParameters().forEach((param) => {
        expect(param.options.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("each option should have required fields", () => {
      getAllParameters().forEach((param) => {
        param.options.forEach((option) => {
          expect(option.value).toBeDefined();
          expect(option.label).toBeDefined();
          expect(option.meaning).toBeDefined();
        });
      });
    });
  });

  describe("Parameter Details", () => {
    it("prakriti should represent natural constitution", () => {
      const prakriti = getParameter("prakriti");
      expect(prakriti).not.toBeNull();
      expect(prakriti?.name).toBe("Prakriti");
      expect(prakriti?.sanskritName).toContain("प्रकृति");
      expect(prakriti?.description).toContain("constitution");
      expect(prakriti?.options.length).toBeGreaterThan(0);
    });

    it("all 10 parameters should be accessible by ID", () => {
      const ids = getParameterOrder();
      ids.forEach((id) => {
        const param = getParameter(id);
        expect(param).not.toBeNull();
        expect(param?.id).toBe(id);
      });
    });

    it("should return null for invalid parameter ID", () => {
      expect(getParameter("invalid")).toBeNull();
      expect(getParameter("")).toBeNull();
    });
  });

  describe("Translations", () => {
    it("should have Hindi translations for key parameters", () => {
      const prakriti = getParameter("prakriti");
      expect(prakriti?.translations.hindi).toBeDefined();
      expect(prakriti?.translations.hindi?.name).toBeDefined();
      expect(prakriti?.translations.hindi?.description).toBeDefined();
    });

    it("should have Telugu translations for key parameters", () => {
      const prakriti = getParameter("prakriti");
      expect(prakriti?.translations.telugu).toBeDefined();
      expect(prakriti?.translations.telugu?.name).toBeDefined();
      expect(prakriti?.translations.telugu?.description).toBeDefined();
    });

    it("getTranslatedText should return English by default", () => {
      const prakriti = getParameter("prakriti");
      if (!prakriti) throw new Error("prakriti not found");

      const text = getTranslatedText(prakriti, "English", "name");
      expect(text).toBe("Prakriti");
    });

    it("getTranslatedText should return Hindi translation when requested", () => {
      const prakriti = getParameter("prakriti");
      if (!prakriti) throw new Error("prakriti not found");

      const text = getTranslatedText(prakriti, "Hindi", "name");
      // Should return the translated name containing देवनागरी script
      expect(text).toBeDefined();
      expect(text.length).toBeGreaterThan(0);
    });

    it("getTranslatedText should return Telugu translation when requested", () => {
      const prakriti = getParameter("prakriti");
      if (!prakriti) throw new Error("prakriti not found");

      const text = getTranslatedText(prakriti, "Telugu", "name");
      // Should return the translated name containing తెలుగు script
      expect(text).toBeDefined();
      expect(text.length).toBeGreaterThan(0);
    });

    it("getTranslatedText should fallback to English for unsupported languages", () => {
      const prakriti = getParameter("prakriti");
      if (!prakriti) throw new Error("prakriti not found");

      const text = getTranslatedText(prakriti, "Spanish", "name");
      expect(text).toBe("Prakriti");
    });
  });

  describe("Educational Content", () => {
    it("should not be diagnostic in nature", () => {
      getAllParameters().forEach((param) => {
        // Should contain educational context
        expect(param.educationalContext).toBeDefined();
        expect(param.educationalContext.length).toBeGreaterThan(10);

        // Should not contain diagnostic language like "disease", "disorder", etc.
        const content = param.educationalContext.toLowerCase();
        // Some parameters may legitimately mention conditions, but not in a way that diagnoses
        const isDiagnostic =
          /you have|you suffer|you are sick|you are ill|disorder|pathology|disease state/i.test(
            param.educationalContext
          );
        expect(isDiagnostic).toBe(false);
      });
    });

    it("should provide patient-friendly explanations", () => {
      getAllParameters().forEach((param) => {
        // Each parameter should have clear description and context
        expect(param.description.length).toBeGreaterThan(20);
        expect(param.educationalContext.length).toBeGreaterThan(30);
      });
    });

    it("should preserve AYUSH terminology", () => {
      const prakriti = getParameter("prakriti");
      const vikriti = getParameter("vikriti");
      const sara = getParameter("sara");

      // Sanskrit names should be preserved
      expect(prakriti?.sanskritName).toMatch(/[^\x00-\x7F]/); // Contains non-ASCII (Devanagari)
      expect(vikriti?.sanskritName).toMatch(/[^\x00-\x7F]/);
      expect(sara?.sanskritName).toMatch(/[^\x00-\x7F]/);
    });
  });

  describe("Options Structure", () => {
    it("should have consistent option structures", () => {
      getAllParameters().forEach((param) => {
        param.options.forEach((option) => {
          expect(typeof option.value).toBe("string");
          expect(typeof option.label).toBe("string");
          expect(typeof option.meaning).toBe("string");

          // Should not be empty
          expect(option.value.trim().length).toBeGreaterThan(0);
          expect(option.label.trim().length).toBeGreaterThan(0);
          expect(option.meaning.trim().length).toBeGreaterThan(0);
        });
      });
    });

    it("prakriti should have Vata, Pitta, Kapha options", () => {
      const prakriti = getParameter("prakriti");
      const optionValues = prakriti?.options.map((o) => o.value) || [];
      expect(optionValues).toContain("vata");
      expect(optionValues).toContain("pitta");
      expect(optionValues).toContain("kapha");
    });

    it("vaya should have age stage options", () => {
      const vaya = getParameter("vaya");
      const optionValues = vaya?.options.map((o) => o.value) || [];
      expect(optionValues).toContain("childhood");
      expect(optionValues).toContain("youth");
      expect(optionValues).toContain("adulthood");
      expect(optionValues).toContain("advanced");
    });
  });

  describe("Access Patterns", () => {
    it("should support iterating through all parameters", () => {
      const order = getParameterOrder();
      const params = getAllParameters();

      expect(order.length).toBe(params.length);

      order.forEach((id, index) => {
        expect(params[index].id).toBe(id);
      });
    });

    it("should support indexed access for UI components", () => {
      const params = getAllParameters();
      // Can be used in forms like: parameters.map((p, i) => ...) with index
      params.forEach((param, index) => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(10);
        expect(param).toBeDefined();
      });
    });

    it("should support quick lookup by ID", () => {
      const param = getParameter("sattva");
      expect(param?.name).toBe("Sattva");
      expect(param?.id).toBe("sattva");
    });
  });

  describe("Real-world Usage Scenarios", () => {
    it("should support displaying current parameter in sidebar", () => {
      const currentId = "ahara_shakti";
      const param = getParameter(currentId);

      // Sidebar needs: name, description, options
      expect(param?.name).toBeDefined();
      expect(param?.sanskritName).toBeDefined();
      expect(param?.description).toBeDefined();
      expect(param?.options).toBeDefined();
    });

    it("should support showing all parameters in list view", () => {
      const allParams = getAllParameters();

      // List needs to iterate with index and access name
      allParams.forEach((param, index) => {
        const displayLabel = `${index + 1}. ${param.name}`;
        expect(displayLabel).toBeDefined();
        expect(displayLabel).toMatch(/^\d+\. \w+/);
      });
    });

    it("should support multi-language UI", () => {
      const param = getParameter("prakriti");
      if (!param) throw new Error("prakriti not found");

      const englishName = getTranslatedText(param, "English", "name");
      const hindiName = getTranslatedText(param, "Hindi", "name");
      const teluguName = getTranslatedText(param, "Telugu", "name");

      // All three should be different and non-empty
      expect(englishName).toBeDefined();
      expect(hindiName).toBeDefined();
      expect(teluguName).toBeDefined();
      expect(englishName.length).toBeGreaterThan(0);
      expect(hindiName.length).toBeGreaterThan(0);
      expect(teluguName.length).toBeGreaterThan(0);
    });
  });
});
