/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import edit from './edit';
import save from './save';
import attributes from './attributes.json';

registerBlockType( 'xwp/country-card', {
	edit,
	save,
	attributes,
} );
