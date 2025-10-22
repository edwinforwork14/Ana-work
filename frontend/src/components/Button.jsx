import React from 'react';
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Button as BaseButton } from "@/components/base/buttons/button";
import { Check } from "@untitledui/icons";

export function ButtonGroupExample() {
    return (
        <ButtonGroup selectedKeys={[]}>
            <ButtonGroupItem id="archive">Archive</ButtonGroupItem>
            <ButtonGroupItem id="edit">Edit</ButtonGroupItem>
            <ButtonGroupItem id="delete">Delete</ButtonGroupItem>
        </ButtonGroup>
    );
}

export function DestructiveButton() {
    return <BaseButton color="primary-destructive" size="md">Delete project</BaseButton>;
}

export function SecondaryButton() {
    return <BaseButton color="secondary" size="md">Stage for publish</BaseButton>;
}

export function PrimaryButton() {
    return <BaseButton color="primary" size="md" iconLeading={<Check data-icon />}>Publish now</BaseButton>;
}

export default function ButtonDemo() {
    return (
        <div className="space-y-4">
            <ButtonGroupExample />
            <div className="flex gap-3">
                <DestructiveButton />
                <SecondaryButton />
                <PrimaryButton />
            </div>
        </div>
    );
}