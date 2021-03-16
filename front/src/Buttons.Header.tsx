import React from "react"

interface IHeaderButtonProps {
    children?: string;
    className?: string;
    onClick: () => void;
    disabled?: boolean;
}

const HeaderButtonRenderFunction: React.ForwardRefRenderFunction<HTMLButtonElement, IHeaderButtonProps> = (props, ref) => {

    return <button
        // eslint-disable-next-line
        className={'select-none text-center align-top font-sans bg-green-200 focus:outline-none hover:bg-green-400 disabled:opacity-50 shadow-md rounded-sm px-1 py-0.5 mx-0.5 w-16 h-7' + ' ' + props.className}
        ref={ref}
        onClick={props.onClick}
        disabled={props.disabled ? true : false}>
        {props.children}
    </button>
}

export const HeaderButton = React.forwardRef(HeaderButtonRenderFunction);

interface IHeaderFormProps {
    type: string;
    onClick?: () => void;
    className?: string;
    value?: string;
}
const HeaderFormRenderFunction: React.ForwardRefRenderFunction<HTMLInputElement, IHeaderFormProps> = (props, ref) => {

    return <input
        type={props.type}
        ref={ref}
        onClick={props.onClick}
        // eslint-disable-next-line
        className={'select-none text-center align-top font-sans bg-green-200 focus:outline-none hover:bg-green-400 cursor-pointer disabled:opacity-50 shadow-md rounded-sm px-1 py-0.5 mx-0.5 w-16 h-7' + ' ' + props.className}
        value={props.value} />
}

export const HeaderFormButton = React.forwardRef(HeaderFormRenderFunction);