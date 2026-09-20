import { getTranslator } from "./i18n";
import {
  App,
  PluginSettingTab,
  Setting,
  type SettingDefinitionItem,
  type SettingDefinitionGroup,
  type SettingDefinitionPage,
  type ToggleComponent,
} from "obsidian";
import type RefinedLayoutPlugin from "./main";
import {
  HEADING_LEVELS,
  type ModeKey,
} from "./settings";

import {
  SettingsCatalog, getSettingsTabs, getModeLabels, HEADING_LABELS,
  type SettingsTabDefinition, type NumberField,
} from "./settings-catalog";
export type { ResettableSection } from "./settings-catalog";

export class RefinedLayoutSettingTab extends PluginSettingTab {
  private t = getTranslator();
  private mode: ModeKey = "edit";
  private legacyPage: string | null = null;

  constructor(app: App, private readonly plugin: RefinedLayoutPlugin) {
    super(app, plugin);
  }

  display(): void {
    // Fallback for hosts older than 1.13; newer hosts render the definitions.
    this.renderHome(this.containerEl);
  }

  private refresh(): void {
    if (typeof PluginSettingTab.prototype.update === "function") {
      this.update();
    } else {
      this.renderHome(this.containerEl);
    }
  }

  private renderHome(containerEl: HTMLElement): void {
    containerEl.empty();
    containerEl.addClass("refined-layout-settings");
    const items = this.getSettingDefinitions();
    const pages = items.flatMap((item) => "items" in item ? item.items ?? [] : []);
    const page = pages.find((item): item is SettingDefinitionPage =>
      "type" in item && item.type === "page" && item.name === this.legacyPage);
    if (page) {
      new Setting(containerEl).setName(page.name).setHeading().addExtraButton((button) => {
        button.setIcon("arrow-left").setTooltip(this.t("actions.back")).onClick(() => {
          this.legacyPage = null;
          this.refresh();
        });
      });
    }
    this.renderLegacyItems(containerEl, page?.items ?? items);
  }

  // Older hosts use the same two-level definitions, without native navigation.
  private renderLegacyItems(container: HTMLElement, items: SettingDefinitionItem[]): void {
    for (const item of items) {
      if ("type" in item) {
        if (item.type === "page") {
          new Setting(container).setName(item.name).setDesc(item.desc ?? "")
            .addExtraButton((button) => button.setIcon("chevron-right")
              .setTooltip(item.name).onClick(() => {
                this.legacyPage = item.name;
                this.refresh();
              }));
        } else {
          const group = container.createDiv({ cls: `setting-group ${item.cls ?? ""}` });
          if (item.heading) new Setting(group).setName(item.heading).setHeading();
          this.renderLegacyItems(group, item.items ?? []);
        }
      } else if ("render" in item && item.render) {
        const setting = new Setting(container).setName(item.name).setDesc(item.desc ?? "");
        // Our definitions only use Setting; the native group argument is unused.
        (item.render as (setting: Setting) => void)(setting);
      }
    }
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    this.t = getTranslator(this.plugin.settings.language);
    const t = this.t;
    // Capture the mode in every callback so stale controls cannot write to the
    // other configuration after switching the home tab.
    const mode = this.mode;
    const modes = getModeLabels(t);
    const pages = getSettingsTabs(t).map((tab): SettingDefinitionPage => ({
      type: "page",
      name: `${modes[mode]} · ${tab.label}`,
      desc: tab.description,
      items: [
        {
          name: tab.label,
          desc: tab.description,
          render: (setting) => { this.renderModule(setting, mode, tab, () => this.refresh()); },
        },
        ...new SettingsCatalog(t, mode).build(tab).flatMap((group): SettingDefinitionGroup[] => {
          const makeGroup = (heading: string, fields: NumberField[]): SettingDefinitionGroup => ({
            type: "group",
            heading,
            cls: "refined-layout-settings rl-settings-native-group",
            items: fields.map((field) => ({
              name: field.name,
              desc: field.description,
              aliases: [modes[mode], tab.label, group.title, field.path.join(" ")],
              render: (setting) => {
                this.renderNumber(setting, mode, field);
                setting.setDisabled(!this.plugin.settings[mode].modules[tab.module]);
              },
            })),
          });
          return "fields" in group
            ? [makeGroup(group.title, group.fields)]
            : HEADING_LEVELS.map((level) => makeGroup(`${group.title} · ${HEADING_LABELS[level]}`, group.levels[level]));
        }),
      ],
    }));

    return [
      {
        type: "group",
        items: [
          { name: t("language.name"), desc: t("language.description"), render: (setting) => { this.renderLanguage(setting); } },
          ...([
            ["actions.export", "actions.exportDesc", () => this.plugin.exportSettings()],
            ["actions.import", "actions.importDesc", () => this.pickSettingsFile()],
            ["actions.resetAll", "actions.resetAllDesc", () => { this.plugin.resetAll(); this.refresh(); }],
          ] as const).map(([name, desc, onClick]) => ({
            name: t(name),
            desc: t(desc),
            render: (setting: Setting) => {
              setting.addButton((button) => button.setButtonText(t(name)).onClick(onClick));
            },
          })),
        ],
      },
      {
        type: "group",
        cls: "rl-settings-mode-group",
        items: [{
          name: "",
          searchable: false,
          render: (setting) => {
            setting.settingEl.empty();
            setting.settingEl.addClass("refined-layout-settings", "rl-settings-mode-row");
            this.renderModeSwitch(setting.settingEl);
          },
        }],
      },
      { type: "group", items: pages },
    ];
  }

  private renderModeSwitch(container: HTMLElement): void {
    const modeSwitch = container.createDiv({
      cls: "rl-settings-mode-switch",
      attr: { role: "group", "aria-label": this.t("aria.mode") },
    });
    for (const mode of ["edit", "read"] as const) {
      const button = modeSwitch.createEl("button", {
        cls: `rl-settings-mode-button ${this.mode === mode ? "rl-settings-mode-active" : ""}`,
        text: getModeLabels(this.t)[mode],
        attr: { type: "button", "aria-pressed": String(this.mode === mode) },
      });
      button.addEventListener("click", () => {
        if (this.mode === mode) return;
        this.mode = mode;
        this.refresh();
        this.containerEl.querySelector<HTMLButtonElement>(".rl-settings-mode-active")?.focus();
      });
    }
  }

  private renderLanguage(setting: Setting): void {
    setting
      .setName(this.t("language.name"))
      .setDesc(this.t("language.description"))
      .addDropdown((dropdown) => {
        dropdown
          .addOptions({
            auto: this.t("language.auto"),
            "zh-CN": "简体中文",
            "zh-TW": "繁體中文",
            en: "English",
            ja: "日本語",
          })
          .setValue(this.plugin.settings.language)
          .onChange((value) => {
            this.plugin.setLanguage(value);
            this.refresh();
            setting.settingEl.doc.querySelector<HTMLSelectElement>(".rl-settings-language")?.focus();
          });
        dropdown.selectEl.addClass("rl-settings-language");
        dropdown.selectEl.setAttribute("aria-label", this.t("language.name"));
      });

  }

  private pickSettingsFile(): void {
    const input = createEl("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (file === undefined) {
        return;
      }
      void this.plugin.importSettings(file).then((imported) => {
        if (imported) {
          this.refresh();
        }
      });
    });
    input.click();
  }

  private renderModule(setting: Setting, mode: ModeKey, tab: SettingsTabDefinition, onToggle: (enabled: boolean) => void): void {
    setting
      .setName(tab.label)
      .setDesc(`${getModeLabels(this.t)[mode]} · ${tab.description}`)
      .addToggle((toggle: ToggleComponent) => {
        toggle.setValue(this.plugin.settings[mode].modules[tab.module]).onChange((value) => {
          this.plugin.setModule(mode, tab.module, value);
          onToggle(value);
        });
      })
      .addExtraButton((button) => {
        button
          .setIcon("reset")
          .setTooltip(this.t("actions.resetSection"))
          .onClick(() => {
            if (tab.reset === "headingDecoration") {
              this.plugin.resetHeadingDecoration(mode);
            } else {
              this.plugin.resetSection(mode, tab.reset, tab.module);
            }
            this.refresh();
          });
      });

  }

  private renderNumber(setting: Setting, mode: ModeKey, field: NumberField): void {
    const { path, name, description, options: config } = field;
    setting.setName(name).setDesc(description);
    setting.addText((text) => {
      text.setValue(String(this.plugin.getNumber(mode, path)));
      text.inputEl.type = "number";
      text.inputEl.step = String(config.step);
      text.inputEl.min = String(config.min);
      text.inputEl.max = String(config.max);
      text.inputEl.addClass("rl-settings-number");
      text.onChange((rawValue) => {
        const parsed = Number(rawValue);
        if (!Number.isFinite(parsed) || parsed < config.min || parsed > config.max) return;
        this.plugin.setNumber(mode, path, parsed);
      });
    });
    if (config.unit !== "") {
      setting.controlEl.createSpan({ cls: "rl-settings-unit", text: config.unit === "ratio" ? this.t("unit.ratio") : config.unit });
    }
  }
}
