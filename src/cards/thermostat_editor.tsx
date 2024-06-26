import { type JSX } from "solid-js";
import {
	LovelaceCardEditor,
	baseLovelaceCardConfig,
	loadEditorForCard,
} from "../LovelaceCardEditor";
import { ThermostatCardConfig } from "./thermostat";
import { assign, object, optional, string } from "superstruct";
import type { HaFormSchema, SchemaUnion } from "../hass/form";
import { fireEvent } from "custom-card-helpers";
import strings from "./thermostat_editor.icu";
import { localize } from "src/Localized";

await loadEditorForCard({ type: "thermostat", entity: "climate.__fake" });

const cardConfigStruct = assign(
	baseLovelaceCardConfig,
	object({
		entity: optional(string()),
		name: optional(string()),
	}),
);

const SCHEMA = [
	{ name: "entity", selector: { entity: { domain: "climate" } } },
	{
		type: "grid",
		name: "",
		schema: [
			{ name: "name", selector: { text: {} } },
			{ name: "show_status", type: "boolean", default: false },
		],
	},
	{ name: "toggle_entity", selector: { entity: { domain: "switch" } } },
	{ name: "floor_temp_entity", selector: { entity: { domain: "sensor" } } },
] as const satisfies readonly HaFormSchema[];

class ThermostatEditor extends LovelaceCardEditor<ThermostatCardConfig> {
	render(): JSX.Element {
		const computeLabelCallback = (schema: SchemaUnion<typeof SCHEMA>) => {
			switch (schema.name) {
				case "entity":
					return localize(strings.entity);
				case "name":
					return localize(strings.name);
				case "toggle_entity":
					return localize(strings.toggle_entity);
				case "floor_temp_entity":
					return localize(strings.floor_temp_entity);
				case "show_status":
					return localize(strings.show_status);
				default:
					if ((schema as any).name === "") {
						return "";
					}

					assertNever(schema);
			}
		};

		const valueChanged = (ev: CustomEvent) => {
			fireEvent(this, "config-changed", { config: ev.detail.value });
		};

		return (
			<>
				<ha-form
					hass={this.hass}
					data={this.config}
					schema={SCHEMA}
					prop:computeLabel={computeLabelCallback}
					on:value-changed={valueChanged}
				/>
			</>
		);
	}
}

export const tag = "yolodev-thermostat-editor";
customElements.define(tag, ThermostatEditor);

const assertNever = (value: never): never => {
	throw new Error(
		`Unhandled discriminated union member: ${JSON.stringify(value)}`,
	);
};

declare module "solid-js" {
	namespace JSX {
		interface IntrinsicElements {
			"ha-entity-picker": any;
		}
	}
}
