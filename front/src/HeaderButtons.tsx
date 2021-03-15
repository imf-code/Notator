interface IHeaderButtonProps {
    children?: string;
    className?: string;
    onClick: () => void;
    disabled?: boolean;
}

export default function HeaderButton(props: IHeaderButtonProps) {

    return <button
        // eslint-disable-next-line
        className={'text-center align-top font-sans bg-green-200 focus:outline-none hover:bg-green-400 disabled:opacity-50 shadow-md rounded-sm px-1 py-0.5 mx-0.5 w-16 h-7' + ' ' + props.className}
        onClick={props.onClick}
        disabled={props.disabled ? true : false}>
        {props.children}
    </button>
}

interface IHeaderSubmitProps {
    children?: string;
    className?: string;
    value?: string;
    ref?: React.RefObject<HTMLInputElement>;
}
export function HeaderSubmit(props: IHeaderSubmitProps) {

    return <input
        type='submit'
        ref={props.ref}
        // eslint-disable-next-line
        className={'text-center align-top font-sans bg-green-200 focus:outline-none hover:bg-green-400 cursor-pointer disabled:opacity-50 shadow-md rounded-sm px-1 py-0.5 mx-0.5 w-16 h-7' + ' ' + props.className}
        value={props.children || props.value} />
}