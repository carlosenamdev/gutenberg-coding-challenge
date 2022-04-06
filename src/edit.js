/**
 * Internal dependencies
 */
import './editor.scss';
/**
 * WordPress dependencies
 */
import { edit, globe } from '@wordpress/icons';
import { BlockControls, useBlockProps } from '@wordpress/block-editor';
import {
	ComboboxControl,
	Placeholder,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import countries from '../assets/countries.json';
import { getEmojiFlag } from './utils';
import Preview from './preview';

export default function Edit( { attributes, setAttributes } ) {
	const { countryCode, relatedPosts } = attributes;
	const options = Object.keys( countries ).map( ( code ) => ( {
		value: code,
		label: getEmojiFlag( code ) + '  ' + countries[ code ] + ' — ' + code,
	} ) );

	const [ isPreview, setPreview ] = useState();

	useEffect( () => setPreview( countryCode ), [ countryCode ] );

	const handleChangeCountry = () => {
		if ( isPreview ) setPreview( false );
		else if ( countryCode ) setPreview( true );
	};

	const handleChangeCountryCode = ( newCountryCode ) => {
		if ( newCountryCode && countryCode !== newCountryCode ) {
			setAttributes( {
				countryCode: newCountryCode,
				relatedPosts: [],
			} );
		}
	};

	useEffect( () => {
		async function getRelatedPosts() {
			const postId = window.location.href.match( /post=([\d]+)/ )[ 1 ];

			const searchQuery = {
				search: countries[ countryCode ],
				exclude: postId,
			};

			try {
				const posts = await apiFetch( {
					path: addQueryArgs( '/wp/v2/posts', searchQuery ),
				} );

				setAttributes( {
					relatedPosts:
						posts?.map( ( relatedPost ) => {
							let excerpt = relatedPost.excerpt?.rendered || '';

							if ( excerpt ) {
								// Remove HTML tags.
								excerpt = excerpt.replace(
									/(<([^>]+)>)/gi,
									''
								);

								if ( excerpt.length > 26 ) {
									excerpt = excerpt.slice( 0, 26 ) + '...';
								}
							}

							return {
								...relatedPost,
								title:
									relatedPost.title?.rendered ||
									relatedPost.link,
								excerpt,
							};
						} ) || [],
				} );
			} catch ( e ) {
				throw new Error( `HTTP error! Status: ${ e.message }` );
			}
		}

		getRelatedPosts();
	}, [ countryCode, setAttributes ] );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={ __( 'Change Country', 'xwp-country-card' ) }
						icon={ edit }
						onClick={ handleChangeCountry }
						disabled={ ! Boolean( countryCode ) }
					/>
				</ToolbarGroup>
			</BlockControls>
			<div { ...useBlockProps() }>
				{ isPreview ? (
					<Preview
						countryCode={ countryCode }
						relatedPosts={ relatedPosts }
					/>
				) : (
					<Placeholder
						icon={ globe }
						label={ __( 'XWP Country Card', 'xwp-country-card' ) }
						isColumnLayout={ true }
						instructions={ __(
							'Type in a name of a contry you want to display on you site.',
							'xwp-country-card'
						) }
					>
						<ComboboxControl
							label={ __( 'Country', 'xwp-country-card' ) }
							hideLabelFromVision
							options={ options }
							value={ countryCode }
							onChange={ handleChangeCountryCode }
							allowReset={ true }
						/>
					</Placeholder>
				) }
			</div>
		</>
	);
}
