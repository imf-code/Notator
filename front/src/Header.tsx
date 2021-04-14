interface IHeaderProps {
    children?: JSX.Element | JSX.Element[] | undefined;
    /** Name of the user. Displayed in the header. */
    name: string | undefined;
}

/**
 * Stylized header
 */
export default function Header(props: IHeaderProps) {

    return (
        <div className='flex top-0 justify-between w-full h-11 pt-2 px-2 bg-green-300'>

            <div className='text-xl font-medium select-none cursor-pointer'
                onClick={() => window.location.reload()}>
                Notes of&nbsp;
                <span className='capitalize'>
                    {props.name}
                </span>
            </div>

            {props.children}

        </div>
    )
}
