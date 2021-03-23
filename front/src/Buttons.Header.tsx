import React from "react"

interface IHeaderButtonProps {
    children?: string;
    className?: string;
    onClick: () => void;
    disabled?: boolean;
}

const HeaderButtonRenderFunction: React.ForwardRefRenderFunction<HTMLButtonElement, IHeaderButtonProps> = (props, ref) => {

    return <button
        className={`${props.className} select-none text-center align-top font-sans bg-green-200 focus:outline-none hover:bg-green-400 disabled:opacity-50
            shadow-md rounded-sm px-1 py-0.5 mx-0.5 w-16 h-7`}
        ref={ref}
        onClick={props.onClick}
        disabled={props.disabled ? true : false}>
        {props.children}
    </button>
}

/** HTML button element stylized for use in the header */
export const HeaderButton = React.forwardRef(HeaderButtonRenderFunction);

interface IHeaderFormProps {
    type: 'button' | 'submit';
    onClick?: () => void;
    className?: string;
    value?: string;
}
const HeaderFormRenderFunction: React.ForwardRefRenderFunction<HTMLInputElement, IHeaderFormProps> = (props, ref) => {

    return <input
        type={props.type}
        ref={ref}
        onClick={props.onClick}
        className={`${props.className} select-none text-center align-top font-sans bg-green-200 focus:outline-none hover:bg-green-400 cursor-pointer disabled:opacity-50 
            shadow-md rounded-sm px-1 py-0.5 mx-0.5 w-16 h-7`}
        value={props.value} />
}

/** HTML input element with button or submit type stylized for use in the header */
export const HeaderFormButton = React.forwardRef(HeaderFormRenderFunction);